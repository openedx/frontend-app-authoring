import React from 'react';
import PropTypes from 'prop-types';
import { Form } from '@edx/paragon';
import { useFormik } from 'formik';

import DivisionByGroupFields from '../shared/DivisionByGroupFields';
import AnonymousPostingFields from '../shared/AnonymousPostingFields';
import BlackoutDatesField from '../shared/BlackoutDatesField';

export default function LegacyConfigForm({
  appConfig, onSubmit, formRef,
}) {
  const {
    handleSubmit,
    handleChange,
    handleBlur,
    values,
  } = useFormik({
    initialValues: appConfig,
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
};
