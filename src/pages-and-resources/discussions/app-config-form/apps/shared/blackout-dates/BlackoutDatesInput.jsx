import React, { useState } from 'react';
import { Form, TransitionReplace } from '@edx/paragon';
import { useFormikContext } from 'formik';
import PropTypes from 'prop-types';

import { checkFieldErrors } from '../../../utils';

const BlackoutDatesInput = ({
  index,
  value,
  type,
  label,
  fieldName,
  helpText,
  fieldClasses,
  helperClasses,
  formGroupClasses,
}) => {
  const {
    handleChange, handleBlur, errors, touched,
  } = useFormikContext();
  const [inFocus, setInFocus] = useState(false);
  const isInvalidInput = checkFieldErrors(touched, errors, 'blackoutDates', fieldName, index);

  const renderFormFeedback = (message, messageType = 'default') => (
    <Form.Control.Feedback type={messageType} hasIcon={false}>
      <div className={`small ${helperClasses}`}>{message}</div>
    </Form.Control.Feedback>
  );

  const handleFocusOut = (event) => {
    handleBlur(event);
    setInFocus(false);
  };

  return (
    <Form.Group
      controlId={`blackoutDates.${index}.${fieldName}`}
      className={`col ${formGroupClasses}`}
      isInvalid={!inFocus && isInvalidInput}
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
      <TransitionReplace key={index} className="mt-1">
        {inFocus ? (
          <React.Fragment key="open">{renderFormFeedback(helpText)}</React.Fragment>
        ) : (
          <React.Fragment key="closed" />
        )}
      </TransitionReplace>
      <TransitionReplace key={`${index}-error`}>
        {!inFocus && isInvalidInput ? (
          <React.Fragment key="open">
            {renderFormFeedback(errors?.blackoutDates[index][fieldName], 'invalid')}
          </React.Fragment>
        ) : (
          <React.Fragment key="closed" />
        )}
      </TransitionReplace>
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
  helperClasses: PropTypes.string,
  fieldClasses: PropTypes.string,
  formGroupClasses: PropTypes.string,
};

BlackoutDatesInput.defaultProps = {
  fieldClasses: '',
  helpText: '',
  helperClasses: '',
  formGroupClasses: '',
};

export default BlackoutDatesInput;
