import React from 'react';
import PropTypes from 'prop-types';
import { Card, Form } from '@edx/paragon';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import DivisionByGroupFields from '../shared/DivisionByGroupFields';
import AnonymousPostingFields from '../shared/AnonymousPostingFields';
import BlackoutDatesField, { blackoutDatesRegex } from '../shared/BlackoutDatesField';

import messages from '../shared/messages';
import AppConfigFormDivider from '../shared/AppConfigFormDivider';

function LegacyConfigForm({
  appConfig, onSubmit, formRef, intl, title,
}) {
  const {
    handleSubmit,
    handleChange,
    handleBlur,
    values,
    errors,
  } = useFormik({
    initialValues: appConfig,
    validationSchema: Yup.object().shape({
      blackoutDates: Yup.string().matches(
        blackoutDatesRegex,
        intl.formatMessage(messages.blackoutDatesFormattingError),
      ),
    }),
    onSubmit,
  });

  return (
    <Card className="mb-5 px-4 px-sm-5 pb-5" data-testid="legacyConfigForm">
      <Form ref={formRef} onSubmit={handleSubmit}>
        <h3 className="text-primary-500 my-3">{title}</h3>
        <AppConfigFormDivider thick />
        <AnonymousPostingFields
          onBlur={handleBlur}
          onChange={handleChange}
          values={values}
        />
        <AppConfigFormDivider />
        <DivisionByGroupFields
          onBlur={handleBlur}
          onChange={handleChange}
          values={values}
        />
        <AppConfigFormDivider thick />
        <BlackoutDatesField
          errors={errors}
          onBlur={handleBlur}
          onChange={handleChange}
          values={values}
        />
      </Form>
    </Card>
  );
}

LegacyConfigForm.propTypes = {
  appConfig: PropTypes.shape({
    divideByCohorts: PropTypes.bool.isRequired,
    divideCourseWideTopics: PropTypes.bool.isRequired,
    divideGeneralTopic: PropTypes.bool.isRequired,
    divideQuestionsForTAsTopic: PropTypes.bool.isRequired,
    allowAnonymousPosts: PropTypes.bool.isRequired,
    allowAnonymousPostsPeers: PropTypes.bool.isRequired,
    blackoutDates: PropTypes.string.isRequired,
  }),
  onSubmit: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  formRef: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  title: PropTypes.string.isRequired,
};

LegacyConfigForm.defaultProps = {
  appConfig: {
    divideByCohorts: false,
    allowDivisionByUnit: false,
    divideCourseWideTopics: false,
    divideGeneralTopic: false,
    divideQuestionsForTAsTopic: false,
    allowAnonymousPosts: false,
    allowAnonymousPostsPeers: false,
    blackoutDates: '[]',
  },
};

export default injectIntl(LegacyConfigForm);
