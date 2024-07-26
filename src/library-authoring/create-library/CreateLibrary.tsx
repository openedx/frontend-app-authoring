import React from 'react';
import { StudioFooter } from '@edx/frontend-component-footer';
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

import { REGEX_RULES } from '../../constants';
import Header from '../../header';
import FormikControl from '../../generic/FormikControl';
import FormikErrorFeedback from '../../generic/FormikErrorFeedback';
import AlertError from '../../generic/alert-error';
import { useOrganizationListData } from '../../generic/data/apiHooks';
import SubHeader from '../../generic/sub-header/SubHeader';
import { useCreateLibraryV2 } from './data/apiHooks';
import messages from './messages';

const CreateLibrary = () => {
  const intl = useIntl();
  const navigate = useNavigate();

  const { noSpaceRule, specialCharsRule } = REGEX_RULES;
  const validSlugIdRegex = /^[a-zA-Z\d]+(?:[\w-]*[a-zA-Z\d]+)*$/;

  const {
    mutate,
    data,
    isLoading,
    isError,
    error,
  } = useCreateLibraryV2();

  const {
    data: organizationListData,
    isLoading: isOrganizationListLoading,
  } = useOrganizationListData();

  const handleOnClickCancel = () => {
    navigate('/libraries');
  };

  if (data) {
    navigate(`/library/${data.id}`);
  }

  return (
    <>
      <Header isHiddenMainMenu />
      <Container size="xl" className="p-4 mt-3">
        <SubHeader
          title={intl.formatMessage(messages.createLibrary)}
        />
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
                  onChange={(event) => formikProps.setFieldValue('org', event.selectionId)}
                  placeholder={intl.formatMessage(messages.orgPlaceholder)}
                >
                  {organizationListData ? organizationListData.map((org) => (
                    <Form.AutosuggestOption key={org} id={org}>{org}</Form.AutosuggestOption>
                  )) : []}
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
              <ActionRow className="justify-content-start">
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
                  state={isLoading ? 'disabled' : 'enabled'}
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
      <StudioFooter />
    </>
  );
};

export default CreateLibrary;
