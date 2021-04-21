import React from 'react';
import PropTypes from 'prop-types';
import { Form, SwitchControl } from '@edx/paragon';

export default function FormSwitchGroup({
  id, label, helpText, className, onChange, onBlur, checked,
}) {
  const helpTextId = `${id}HelpText`;

  // Note that we use controlId here _and_ set some IDs and aria-describedby attributes manually.
  // controlId doesn't cover Form.Switch properly, so controlId is just helping to attach
  // a 'for' attribute to the Label.
  return (
    <Form.Group
      controlId={id}
      className={className}
    >
      <div className="d-flex justify-content-between">
        <div className="pr-3">
          <Form.Label>
            {label}
          </Form.Label>
          <Form.Text
            id={helpTextId}
            muted
          >
            {helpText}
          </Form.Text>
        </div>
        <div>
          <SwitchControl
            id={id}
            aria-describedby={helpTextId}
            onChange={onChange}
            onBlur={onBlur}
            checked={checked}
          />
        </div>
      </div>

    </Form.Group>
  );
}
FormSwitchGroup.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  helpText: PropTypes.string.isRequired,
  className: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
  checked: PropTypes.bool.isRequired,
};
FormSwitchGroup.defaultProps = {
  className: null,
};
