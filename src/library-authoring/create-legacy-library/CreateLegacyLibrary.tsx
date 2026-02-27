import { StudioFooterSlot } from '@edx/frontend-component-footer';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Alert,
  Container,
  Form,
  Button,
  StatefulButton,
  ActionRow,
} from '@openedx/paragon';
import { Warning } from '@openedx/paragon/icons';
import { Formik } from 'formik';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import classNames from 'classnames';

import { REGEX_RULES } from '@src/constants';
import { useOrganizationListData } from '@src/generic/data/apiHooks';
import { useStudioHome } from '@src/studio-home/hooks';
import Header from '@src/header';
import SubHeader from '@src/generic/sub-header/SubHeader';
import FormikControl from '@src/generic/FormikControl';
import FormikErrorFeedback from '@src/generic/FormikErrorFeedback';
import AlertError from '@src/generic/alert-error';

import messages from '@src/library-authoring/create-library/messages';
import type { LibraryV1Data } from '@src/studio-home/data/api';
import legacyMessages from './messages';
import { useCreateLibraryV1 } from './data/apiHooks';

/**
 * Renders the form and logic to create a new library.
 *
 * Use `showInModal` to render this component in a way that can be
 * used in a modal. Currently this component is used in a modal in the
 * legacy libraries migration flow.
 */
export const CreateLegacyLibrary = ({
  showInModal = false,
  handleCancel,
  handlePostCreate,
}: {
  showInModal?: boolean,
  handleCancel?: () => void,
  handlePostCreate?: (library: LibraryV1Data) => void,
}) => {
  const intl = useIntl();
  const navigate = useNavigate();

  const { noSpaceRule, specialCharsRule } = REGEX_RULES;
  const validSlugIdRegex = /^[a-zA-Z\d]+(?:[\w-]*[a-zA-Z\d]+)*$/;

  const {
    mutate,
    data,
    isPending,
    isError,
    error,
  } = useCreateLibraryV1();

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
      navigate('/libraries-v1');
    }
  };

  if (data) {
    if (handlePostCreate) {
      handlePostCreate(data);
    } else {
      window.location.assign(`${getConfig().STUDIO_BASE_URL}${data.url}`);
    }
  }

  return (
    <>
      {!showInModal && (<Header isHiddenMainMenu />)}
      <Container size="xl" className="p-4 mt-3">
        {!showInModal && (
          <SubHeader
            title={intl.formatMessage(legacyMessages.createLibrary)}
          />
        )}
        <Alert variant="warning" icon={Warning}>
          <Alert.Heading>{intl.formatMessage(legacyMessages.warningTitle)}</Alert.Heading>
          {intl.formatMessage(legacyMessages.warningBody)}
        </Alert>
        <Formik
          initialValues={{
            displayName: '',
            org: '',
            number: '',
          }}
          validationSchema={
            Yup.object().shape({
              displayName: Yup.string()
                .required(intl.formatMessage(messages.requiredFieldError)),
              org: Yup.string()
                .required(intl.formatMessage(messages.requiredFieldError))
                .matches(
                  specialCharsRule,
                  intl.formatMessage(messages.disallowedCharsError),
                )
                .matches(noSpaceRule, intl.formatMessage(messages.noSpaceError)),
              number: Yup.string()
                .required(intl.formatMessage(messages.requiredFieldError))
                .matches(
                  validSlugIdRegex,
                  intl.formatMessage(messages.invalidSlugError),
                ),
            })
          }
          onSubmit={(values) => mutate(values)}
        >
          {(formikProps) => (
            <Form onSubmit={formikProps.handleSubmit}>
              <FormikControl
                name="displayName"
                label={<Form.Label>{intl.formatMessage(legacyMessages.titleLabel)}</Form.Label>}
                value={formikProps.values.displayName}
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
                name="number"
                label={<Form.Label>{intl.formatMessage(messages.slugLabel)}</Form.Label>}
                value={formikProps.values.number}
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
                    enabled: intl.formatMessage(legacyMessages.createLibraryButton),
                    disabled: intl.formatMessage(legacyMessages.createLibraryButtonPending),
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
