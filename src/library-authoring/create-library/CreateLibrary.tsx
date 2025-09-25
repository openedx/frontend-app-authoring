import { StudioFooterSlot } from '@edx/frontend-component-footer';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Container,
  Form,
  Button,
  StatefulButton,
  ActionRow,
} from '@openedx/paragon';
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

import { useCreateLibraryV2 } from './data/apiHooks';
import messages from './messages';
import type { ContentLibrary } from '../data/api';

export const CreateLibrary = ({
  showInModal = false,
  handleCancel = null,
  handlePostCreate = null,
}: {
  showInModal?: boolean,
  handleCancel?: (() => void) | null,
  handlePostCreate?: ((library: ContentLibrary) => void) | null,
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
  } = useCreateLibraryV2();

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
          />
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
          onSubmit={(values) => mutate(values)}
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
