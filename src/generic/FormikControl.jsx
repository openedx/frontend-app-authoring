import { Form } from '@edx/paragon';
import { getIn, useFormikContext } from 'formik';
import PropTypes from 'prop-types';
import React from 'react';
import FormikErrorFeedback from './FormikErrorFeedback';

function FormikControl({
  name,
  label,
  help,
  className,
  ...params
}) {
  const {
    touched, errors, handleChange, handleBlur, setFieldError,
  } = useFormikContext();
  const fieldTouched = getIn(touched, name);
  const fieldError = getIn(errors, name);
  const handleFocus = (e) => setFieldError(e.target.name, undefined);

  return (
    <Form.Group className={className}>
      {label}
      <Form.Control
        {...params}
        name={name}
        className="pb-2"
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        isInvalid={fieldTouched && fieldError}
      />
      <FormikErrorFeedback name={name}>
        <Form.Text>{help}</Form.Text>
      </FormikErrorFeedback>
    </Form.Group>
  );
}

FormikControl.propTypes = {
  name: PropTypes.element.isRequired,
  label: PropTypes.element.isRequired,
  help: PropTypes.element.isRequired,
  className: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
};

export default FormikControl;
