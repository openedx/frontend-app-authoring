import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Form } from '@openedx/paragon';

const FormGroup = (props) => {
  const handleFocus = (e) => {
    if (props.handleFocus) { props.handleFocus(e); }
  };
  const handleClick = (e) => {
    if (props.handleClick) { props.handleClick(e); }
  };
  const handleOnBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      if (props.handleBlur) { props.handleBlur(e); }
    }
  };
  return (
    <Form.Group
      isInvalid={!!props.errorMessage}
      onBlur={handleOnBlur}
      className={props.className}
    >
      <Form.Control
        data-testid="formControl"
        aria-invalid={props.errorMessage}
        autoComplete={props.autoComplete ? 'on' : 'off'}
        onChange={props.handleChange}
        onFocus={handleFocus}
        onClick={handleClick}
        {...props}
      >
        {props.options ? props.options() : null}
      </Form.Control>

      {props.children}

      {props.helpText && _.isEmpty(props.errorMessage) && (
        <Form.Control.Feedback type="default" key="help-text">
          {props.helpText}
        </Form.Control.Feedback>
      )}

      {!_.isEmpty(props.errorMessage) && (
        <Form.Control.Feedback
          type="invalid"
          key="error"
          feedback-for={props.name}
          data-testid="errorMessage"
        >
          {props.errorMessage}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
};

FormGroup.defaultProps = {
  as: 'input',
  errorMessage: '',
  autoComplete: null,
  readOnly: false,
  handleBlur: null,
  handleChange: () => {},
  handleFocus: null,
  handleClick: null,
  helpText: '',
  placeholder: '',
  options: null,
  trailingElement: null,
  type: 'text',
  children: null,
  className: '',
  controlClassName: '',
};

FormGroup.propTypes = {
  as: PropTypes.string,
  errorMessage: PropTypes.string,
  autoComplete: PropTypes.string,
  readOnly: PropTypes.bool,
  floatingLabel: PropTypes.string.isRequired,
  handleBlur: PropTypes.func,
  handleChange: PropTypes.func,
  handleFocus: PropTypes.func,
  handleClick: PropTypes.func,
  helpText: PropTypes.string,
  placeholder: PropTypes.string,
  name: PropTypes.string.isRequired,
  options: PropTypes.func,
  trailingElement: PropTypes.element,
  type: PropTypes.string,
  value: PropTypes.string.isRequired,
  children: PropTypes.element,
  className: PropTypes.string,
  controlClassName: PropTypes.string,
};

export default FormGroup;
