import React from 'react';
import PropTypes from 'prop-types';
import { Form } from '@edx/paragon';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import DivisionByGroupFields from '../shared/DivisionByGroupFields';
import AnonymousPostingFields from '../shared/AnonymousPostingFields';
import BlackoutDatesField, { blackoutDatesRegex } from '../shared/BlackoutDatesField';

import messages from '../shared/messages';

function LegacyConfigForm({
  appConfig, onSubmit, formRef, intl,
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

  const divider = <hr className="my-2" />;

  return (
    <Form ref={formRef} onSubmit={handleSubmit}>
      <h3>Legacy Discussions</h3>
      <DivisionByGroupFields
        onBlur={handleBlur}
        onChange={handleChange}
        values={values}
      />
      {divider}
      <AnonymousPostingFields
        onBlur={handleBlur}
        onChange={handleChange}
        values={values}
      />
      <BlackoutDatesField
        errors={errors}
        onBlur={handleBlur}
        onChange={handleChange}
        values={values}
      />
    </Form>
  );
}

LegacyConfigForm.propTypes = {
  appConfig: PropTypes.shape({
    divideByCohorts: PropTypes.bool.isRequired,
    allowDivisionByUnit: PropTypes.bool.isRequired,
    divideCourseWideTopics: PropTypes.bool.isRequired,
    divideGeneralTopic: PropTypes.bool.isRequired,
    divideQuestionsForTAs: PropTypes.bool.isRequired,
    allowAnonymousPosts: PropTypes.bool.isRequired,
    allowAnonymousPostsPeers: PropTypes.bool.isRequired,
    blackoutDates: PropTypes.string.isRequired,
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  formRef: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(LegacyConfigForm);
