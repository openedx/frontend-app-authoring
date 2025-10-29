import { StudioFooterSlot } from '@edx/frontend-component-footer';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Alert,
  Button,
  Card,
  Container,
  Dropzone,
  Form,
  Icon,
  Spinner,
  StatefulButton,
} from '@openedx/paragon';
import {
  AccessTime,
  Widgets,
} from '@openedx/paragon/icons';
import AlertError from '@src/generic/alert-error';
import classNames from 'classnames';
import { Formik } from 'formik';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';

import { REGEX_RULES } from '@src/constants';
import { useOrganizationListData } from '@src/generic/data/apiHooks';
import FormikControl from '@src/generic/FormikControl';
import FormikErrorFeedback from '@src/generic/FormikErrorFeedback';
import SubHeader from '@src/generic/sub-header/SubHeader';
import Header from '@src/header';
import { useStudioHome } from '@src/studio-home/hooks';

import type { ContentLibrary } from '../data/api';
import { CreateContentLibraryArgs } from './data/api';
import { useCreateLibraryV2, useCreateLibraryRestore, useGetLibraryRestoreStatus } from './data/apiHooks';
import { DROPZONE_ACCEPT_TYPES, LibraryRestoreStatus, VALID_ARCHIVE_EXTENSIONS } from './data/restoreConstants';
import messages from './messages';

/**
 * Renders the form and logic to create a new library.
 *
 * Use `showInModal` to render this component in a way that can be
 * used in a modal. Currently this component is used in a modal in the
 * legacy libraries migration flow.
 */
export const CreateLibrary = ({
  showInModal = false,
  handleCancel,
  handlePostCreate,
}: {
  showInModal?: boolean,
  handleCancel?: () => void,
  handlePostCreate?: (library: ContentLibrary) => void,
}) => {
  const intl = useIntl();
  const navigate = useNavigate();

  const { noSpaceRule, specialCharsRule } = REGEX_RULES;
  const validSlugIdRegex = /^[a-zA-Z\d]+(?:[\w-]*[a-zA-Z\d]+)*$/;

  // State for archive creation
  const [isFromArchive, setIsFromArchive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [restoreTaskId, setRestoreTaskId] = useState<string>('');

  const {
    mutate,
    data,
    isPending,
    isError,
    error,
  } = useCreateLibraryV2();

  const restoreMutation = useCreateLibraryRestore();
  const {
    data: restoreStatus,
  } = useGetLibraryRestoreStatus(restoreTaskId);

  const {
    data: allOrganizations,
    isLoading: isOrganizationListLoading,
  } = useOrganizationListData();

  const {
    studioHomeData: {
      allowedOrganizationsForLibraries,
      allowToCreateNewOrg,
    },
  } = useStudioHome();

  const organizations = (
    allowToCreateNewOrg
      ? allOrganizations
      : allowedOrganizationsForLibraries
  ) || [];

  const handleOnClickCancel = () => {
    if (handleCancel) {
      handleCancel();
    } else {
      navigate('/libraries');
    }
  };

  // Handle toggling create from archive mode
  const handleCreateFromArchive = useCallback(() => {
    setIsFromArchive(true);
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback(({
    fileData,
    handleError,
  }: {
    fileData: FormData;
    requestConfig: any;
    handleError: any;
  }) => {
    const file = fileData.get('file') as File;
    if (file) {
      // Validate file type using the same extensions as the dropzone
      const fileName = file.name.toLowerCase();
      const isValidFile = VALID_ARCHIVE_EXTENSIONS.some(ext => fileName.endsWith(ext));

      if (isValidFile) {
        setUploadedFile(file);
        // Immediately start the restore process
        restoreMutation.mutate(file, {
          onSuccess: (response) => {
            setRestoreTaskId(response.taskId);
          },
          onError: (restoreError) => {
            handleError(restoreError);
          },
        });
      } else {
        // Call handleError for invalid file types
        handleError(new Error(intl.formatMessage(messages.invalidFileTypeError)));
      }
    }
  }, [restoreMutation, intl]);

  if (data) {
    if (handlePostCreate) {
      handlePostCreate(data);
    } else {
      navigate(`/library/${data.id}`);
    }
  }

  return (
    <>
      {!showInModal && (<Header isHiddenMainMenu />)}
      <Container size="md" className="p-4 mt-3">
        {!showInModal && (
          <SubHeader
            title={intl.formatMessage(messages.createLibrary)}
            headerActions={!isFromArchive ? (
              <Button
                variant="outline-primary"
                onClick={handleCreateFromArchive}
              >
                {intl.formatMessage(messages.createFromArchiveButton)}
              </Button>
            ) : null}
          />
        )}

        {/* Archive upload section - shown above form when in archive mode */}
        {isFromArchive && (
          <div className="mb-4">
            {!uploadedFile && !restoreMutation.isPending && (
              <Dropzone
                data-testid="library-archive-dropzone"
                accept={DROPZONE_ACCEPT_TYPES}
                onProcessUpload={handleFileUpload}
                maxSize={5 * 1024 * 1024 * 1024} // 5GB
                style={{ height: '300px' }}
              />
            )}

            {/* Loading state - show spinner in DropZone-like container */}
            {restoreMutation.isPending && (
              <div
                className="border border-2 border-dashed border-light-400 d-flex align-items-center justify-content-center"
                style={{
                  height: '300px',
                  borderRadius: '8px',
                  backgroundColor: '#f8f9fa',
                }}
              >
                <Spinner
                  animation="border"
                  screenReaderText={intl.formatMessage(messages.uploadingStatus)}
                />
              </div>
            )}

            {uploadedFile && restoreStatus?.state === LibraryRestoreStatus.Succeeded && restoreStatus.result && (
              // Show restore result data when succeeded
              <Card className="mb-4">
                <Card.Body>
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-start p-4 text-primary-700">
                    <div className="flex-grow-1 mb-4 mb-md-0">
                      <span className="mb-2">{restoreStatus.result.title}</span>
                      <p className="small mb-0">
                        {restoreStatus.result.org} / {restoreStatus.result.slug}
                      </p>
                    </div>
                    <div className="d-flex flex-column gap-2 align-items-md-end">
                      <div className="d-flex align-items-md-center gap-2">
                        <Icon src={Widgets} style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                        <span className="x-small">
                          {intl.formatMessage(messages.archiveComponentsCount, {
                            count: restoreStatus.result.components,
                          })}
                        </span>
                      </div>
                      <div className="d-flex align-items-md-center gap-2">
                        <Icon src={AccessTime} style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                        <span className="x-small">
                          {intl.formatMessage(messages.archiveBackupDate, {
                            date: new Date(restoreStatus.result.createdAt).toLocaleDateString(),
                            time: new Date(restoreStatus.result.createdAt).toLocaleTimeString(),
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            )}
          </div>
        )}

        {(restoreTaskId || isError || restoreMutation.isError) && (
          <div className="mb-4">
            {restoreStatus?.state === LibraryRestoreStatus.Pending && (
              <Alert variant="info">
                {intl.formatMessage(messages.restoreInProgress)}
              </Alert>
            )}
            {(restoreStatus?.state === LibraryRestoreStatus.Failed || restoreMutation.isError) && (
              <Alert variant="danger">
                {restoreStatus?.state === LibraryRestoreStatus.Failed && (
                  <div>
                    {intl.formatMessage(messages.restoreError)}
                    {restoreStatus.errorLog && (
                      <div>
                        <a href={restoreStatus.errorLog} target="_blank" rel="noopener noreferrer">
                          {intl.formatMessage(messages.viewErrorLogText)}
                        </a>
                      </div>
                    )}
                  </div>
                )}
                {restoreMutation.isError && (
                  <div>
                    {restoreMutation.error?.message
                      || intl.formatMessage(messages.genericErrorMessage)}
                  </div>
                )}
              </Alert>
            )}
          </div>
        )}

        <Formik
          initialValues={{
            title: '',
            org: '',
            slug: '',
          }}
          validationSchema={
            Yup.object().shape({
              title: Yup.string()
                .required(intl.formatMessage(messages.requiredFieldError)),
              org: Yup.string()
                .required(intl.formatMessage(messages.requiredFieldError))
                .matches(
                  specialCharsRule,
                  intl.formatMessage(messages.disallowedCharsError),
                )
                .matches(noSpaceRule, intl.formatMessage(messages.noSpaceError)),
              slug: Yup.string()
                .required(intl.formatMessage(messages.requiredFieldError))
                .matches(
                  validSlugIdRegex,
                  intl.formatMessage(messages.invalidSlugError),
                ),
            })
          }
          onSubmit={(values) => {
            const submitData = { ...values } as CreateContentLibraryArgs;

            // If we're creating from archive and have a successful restore, include the learningPackageId
            if (isFromArchive && restoreStatus?.state === LibraryRestoreStatus.Succeeded && restoreStatus.result) {
              submitData.learning_package = restoreStatus.result.learningPackageId;
            }

            mutate(submitData);
          }}
        >
          {(formikProps) => (
            <Form onSubmit={formikProps.handleSubmit}>
              <FormikControl
                name="title"
                label={<Form.Label>{intl.formatMessage(messages.titleLabel)}</Form.Label>}
                value={formikProps.values.title}
                placeholder={intl.formatMessage(messages.titlePlaceholder)}
                help={intl.formatMessage(messages.titleHelp)}
                className=""
                controlClasses="pb-2"
              />
              <Form.Group>
                <Form.Label>{intl.formatMessage(messages.orgLabel)}</Form.Label>
                <Form.Autosuggest
                  name="org"
                  isLoading={isOrganizationListLoading}
                  onChange={(event) => formikProps.setFieldValue(
                    'org',
                    allowToCreateNewOrg
                      ? (event.selectionId || event.userProvidedText)
                      : event.selectionId,
                  )}
                  placeholder={intl.formatMessage(messages.orgPlaceholder)}
                >
                  {organizations.map((org) => (
                    <Form.AutosuggestOption key={org} id={org}>{org}</Form.AutosuggestOption>
                  ))}
                </Form.Autosuggest>
                <FormikErrorFeedback name="org">
                  <Form.Text>{intl.formatMessage(messages.orgHelp)}</Form.Text>
                </FormikErrorFeedback>
              </Form.Group>
              <FormikControl
                name="slug"
                label={<Form.Label>{intl.formatMessage(messages.slugLabel)}</Form.Label>}
                value={formikProps.values.slug}
                placeholder={intl.formatMessage(messages.slugPlaceholder)}
                help={intl.formatMessage(messages.slugHelp)}
                className=""
                controlClasses="pb-2"
              />
              <ActionRow className={
                classNames(
                  {
                    'justify-content-start': !showInModal,
                    'justify-content-end': showInModal,
                  },
                )
              }
              >
                <Button
                  variant="outline-primary"
                  onClick={handleOnClickCancel}
                >
                  {intl.formatMessage(messages.cancelCreateLibraryButton)}
                </Button>
                <StatefulButton
                  type="submit"
                  variant="primary"
                  className="action btn-primary"
                  state={isPending ? 'disabled' : 'enabled'}
                  disabledStates={['disabled']}
                  labels={{
                    enabled: intl.formatMessage(messages.createLibraryButton),
                    disabled: intl.formatMessage(messages.createLibraryButtonPending),
                  }}
                />
              </ActionRow>
            </Form>
          )}
        </Formik>
        {isError && (<AlertError error={error} />)}

      </Container>
      {!showInModal && (<StudioFooterSlot />)}
    </>
  );
};
