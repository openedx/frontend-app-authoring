import { StudioFooterSlot } from '@edx/frontend-component-footer';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Container,
  Form,
  Button,
  StatefulButton,
  ActionRow,
  Dropzone,
  Card,
  Stack,
  Icon,
  Alert,
} from '@openedx/paragon';
import { Upload, InsertDriveFile, CheckCircle } from '@openedx/paragon/icons';
import { Formik } from 'formik';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import classNames from 'classnames';
import { useState, useCallback } from 'react';

import { REGEX_RULES } from '@src/constants';
import { useOrganizationListData } from '@src/generic/data/apiHooks';
import { useStudioHome } from '@src/studio-home/hooks';
import Header from '@src/header';
import SubHeader from '@src/generic/sub-header/SubHeader';
import FormikControl from '@src/generic/FormikControl';
import FormikErrorFeedback from '@src/generic/FormikErrorFeedback';
import AlertError from '@src/generic/alert-error';

import { useCreateLibraryV2 } from './data/apiHooks';
import { CreateContentLibraryArgs } from './data/api';
import { useCreateLibraryRestore, useGetLibraryRestoreStatus } from './data/restoreHooks';
import { LibraryRestoreStatus } from './data/restoreConstants';
import messages from './messages';
import type { ContentLibrary } from '../data/api';

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
      // Validate file type
      const validExtensions = ['.zip', '.tar.gz', '.tar'];
      const fileName = file.name.toLowerCase();
      const isValidFile = validExtensions.some(ext => fileName.endsWith(ext));
      
      if (isValidFile) {
        setUploadedFile(file);
        // Immediately start the restore process
        restoreMutation.mutate(file, {
          onSuccess: (response) => {
            setRestoreTaskId(response.task_id);
          },
          onError: (restoreError) => {
            handleError(restoreError);
          },
        });
      } else {
        // Call handleError for invalid file types
        handleError(new Error('Invalid file type. Please upload a .zip, .tar.gz, or .tar file.'));
      }
    }
  }, [restoreMutation]);

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
      <Container size="xl" className="p-4 mt-3">
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
            {!uploadedFile && (
              <Dropzone
                data-testid="library-archive-dropzone"
                accept={{
                  'application/zip': ['.zip'],
                  'application/gzip': ['.tar.gz'],
                  'application/x-tar': ['.tar'],
                }}
                onProcessUpload={handleFileUpload}
                maxSize={5 * 1024 * 1024 * 1024} // 5GB
                style={{ height: '300px' }}
                errorMessages={{
                  invalidSize: intl.formatMessage(messages.dropzoneSubtitle),
                  multipleDragged: 'Please upload only one archive file.',
                }}
              >
                <Stack direction="vertical" gap={3} className="text-center">
                  <Icon src={Upload} style={{ height: '64px', width: '64px' }} />
                  <div>
                    <h4>{intl.formatMessage(messages.dropzoneTitle)}</h4>
                    <p className="text-muted">{intl.formatMessage(messages.dropzoneSubtitle)}</p>
                  </div>
                </Stack>
              </Dropzone>
            )}

            {uploadedFile && restoreStatus?.state === LibraryRestoreStatus.Succeeded && restoreStatus.result && (
              // Show restore result data when succeeded
              <Card className="mb-4">
                <Card.Body>
                  <Stack direction="horizontal" gap={3} className="align-items-center">
                    <Icon src={CheckCircle} style={{ height: '40px', width: '40px', color: 'green' }} />
                    <div className="flex-grow-1">
                      <h5 className="mb-1">{restoreStatus.result.title}</h5>
                      <p className="text-muted mb-1">
                        {restoreStatus.result.org} / {restoreStatus.result.slug}
                      </p>
                      <p className="text-muted mb-0 small">
                        Contains {restoreStatus.result.components} Components •
                        Backed up {new Date(restoreStatus.result.created_at).toLocaleDateString()} at{' '}
                        {new Date(restoreStatus.result.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </Stack>
                </Card.Body>
              </Card>
            )}

            {uploadedFile && restoreStatus?.state !== LibraryRestoreStatus.Succeeded && (
              // Show uploaded file info during processing
              <Card className="mb-4">
                <Card.Body>
                  <Stack direction="horizontal" gap={3} className="align-items-center">
                    <Icon src={InsertDriveFile} style={{ height: '40px', width: '40px' }} />
                    <div className="flex-grow-1">
                      <h5 className="mb-1">{uploadedFile.name}</h5>
                      <p className="text-muted mb-0">
                        {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    {restoreMutation.isPending && (
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="sr-only">Processing...</span>
                      </div>
                    )}
                  </Stack>
                </Card.Body>
              </Card>
            )}

            {/* Archive restore status */}
            {restoreTaskId && (
              <div className="mb-4">
                {restoreStatus?.state === LibraryRestoreStatus.Pending && (
                  <Alert variant="info">
                    {intl.formatMessage(messages.restoreInProgress)}
                  </Alert>
                )}
                {restoreStatus?.state === LibraryRestoreStatus.Failed && (
                  <Alert variant="danger">
                    {intl.formatMessage(messages.restoreError)}
                    {restoreStatus.error_log && (
                      <div>
                        <a href={restoreStatus.error_log} target="_blank" rel="noopener noreferrer">
                          View error log
                        </a>
                      </div>
                    )}
                  </Alert>
                )}
              </div>
            )}
          </div>
        )}

        {/* Regular form - always shown */}
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
            
            // If we're creating from archive and have a successful restore, include the learning_package_id
            if (isFromArchive && restoreStatus?.state === LibraryRestoreStatus.Succeeded && restoreStatus.result) {
              submitData.learning_package = restoreStatus.result.learning_package_id;
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
        {(isError || restoreMutation.isError) && (
          <AlertError error={error || restoreMutation.error} />
        )}
      </Container>
      {!showInModal && (<StudioFooterSlot />)}
    </>
  );
};
