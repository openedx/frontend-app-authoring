import React, { useState } from 'react';
import { Form } from '@edx/paragon';
import { useFormikContext, getIn } from 'formik';
import PropTypes from 'prop-types';

import FormikFieldFeedback from '../../../../../../generic/FormikFieldFeedback';

const BlackoutDatesInput = ({
  index,
  value,
  type,
  label,
  fieldName,
  helpText,
  fieldClasses,
  feedbackClasses,
  formGroupClasses,
}) => {
  const {
    handleChange, handleBlur, errors, touched,
  } = useFormikContext();
  const [inFocus, setInFocus] = useState(false);
  const fieldError = getIn(errors, `blackoutDates[${index}].${fieldName}`);
  const fieldTouched = getIn(touched, `blackoutDates[${index}].${fieldName}`);
  const isInvalidInput = Boolean(!inFocus && fieldError && fieldTouched);

  const handleFocusOut = (event) => {
    handleBlur(event);
    setInFocus(false);
  };

  return (
    <Form.Group
      controlId={`blackoutDates.${index}.${fieldName}`}
      className={`col ${formGroupClasses}`}
      isInvalid={isInvalidInput}
    >
      <Form.Control
        value={value}
        type={type}
        onChange={handleChange}
        floatingLabel={label}
        className={fieldClasses}
        onBlur={(event) => handleFocusOut(event)}
        onFocus={() => setInFocus(true)}
      />
      <FormikFieldFeedback
        renderCondition={inFocus}
        feedback={helpText}
        transitionClasses="mt-1"
        feedbackClasses={feedbackClasses}
      />
      <FormikFieldFeedback
        renderCondition={isInvalidInput}
        feedback={fieldError || ''}
        type="invalid"
        transitionClasses="mt-1"
        feedbackClasses={feedbackClasses}
      />
    </Form.Group>
  );
};

BlackoutDatesInput.propTypes = {
  index: PropTypes.number.isRequired,
  value: PropTypes.string.isRequired,
  fieldName: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  helpText: PropTypes.string,
  feedbackClasses: PropTypes.string,
  fieldClasses: PropTypes.string,
  formGroupClasses: PropTypes.string,
};

BlackoutDatesInput.defaultProps = {
  fieldClasses: '',
  helpText: '',
  feedbackClasses: '',
  formGroupClasses: '',
};

export default BlackoutDatesInput;
