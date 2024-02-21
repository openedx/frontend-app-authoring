/* eslint-disable react/jsx-no-useless-fragment */
import { Form } from '@openedx/paragon';
import { getIn, useFormikContext } from 'formik';
import PropTypes from 'prop-types';
import React from 'react';
import FormikErrorFeedback from './FormikErrorFeedback';

const FormikControl = ({
  name,
  label,
  help,
  className,
  controlClasses,
  ...params
}) => {
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
        className={controlClasses}
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
};

FormikControl.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.element,
  help: PropTypes.element,
  className: PropTypes.string,
  controlClasses: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
};

FormikControl.defaultProps = {
  help: <></>,
  label: <></>,
  className: '',
  controlClasses: 'pb-2',
};

export default FormikControl;
