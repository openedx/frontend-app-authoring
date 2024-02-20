import { Form, TransitionReplace } from '@openedx/paragon';
import { getIn, useFormikContext } from 'formik';
import PropTypes from 'prop-types';
import React from 'react';

const FormikErrorFeedback = ({ name, children }) => {
  const { touched, errors } = useFormikContext();
  const fieldTouched = getIn(touched, name);
  const fieldError = getIn(errors, name);

  return (
    <TransitionReplace>
      {fieldTouched && fieldError
        ? (
          <Form.Control.Feedback type="invalid" hasIcon={false} key={`${name}-error-feedback`}>
            {fieldError}
          </Form.Control.Feedback>
        )
        : (
          <React.Fragment key={`${name}-no-error-feedback`}>
            {children}
          </React.Fragment>
        )}
    </TransitionReplace>
  );
};

FormikErrorFeedback.propTypes = {
  name: PropTypes.string.isRequired,
  children: PropTypes.node,
};
FormikErrorFeedback.defaultProps = {
  children: null,
};

export default FormikErrorFeedback;
