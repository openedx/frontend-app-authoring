import React from 'react';
import PropTypes from 'prop-types';
import { Form, SwitchControl } from '@openedx/paragon';

import './FormSwitchGroup.scss';

const FormSwitchGroup = ({
  id,
  name,
  label,
  helpText,
  className,
  onChange,
  onBlur,
  checked,
  disabled,
}) => {
  const helpTextId = `${id}HelpText`;

  // Note that we use controlId here _and_ set some IDs and aria-describedby attributes manually.
  // controlId doesn't cover Form.Switch properly, so controlId is just helping to attach
  // a 'for' attribute to the Label.
  return (
    <Form.Group
      controlId={id}
      className={className}
    >
      <div className="d-flex flex-column">
        <div className="d-flex flex-row justify-content-between align-items-center pb-2">
          <Form.Label className="h4 text-primary-500 m-0">
            {label}
          </Form.Label>
          <SwitchControl
            id={id}
            name={name}
            aria-describedby={helpTextId}
            onChange={onChange}
            onBlur={onBlur}
            checked={checked}
            disabled={disabled}
          />
        </div>
        <Form.Text
          className="mt-0 text-gray-700 helper-text"
          id={helpTextId}
        >
          {helpText}
        </Form.Text>
      </div>
    </Form.Group>
  );
};
FormSwitchGroup.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.node.isRequired,
  name: PropTypes.string,
  helpText: PropTypes.node.isRequired,
  className: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  checked: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
};
FormSwitchGroup.defaultProps = {
  className: null,
  onBlur: null,
  name: null,
  disabled: false,
};

export default FormSwitchGroup;
