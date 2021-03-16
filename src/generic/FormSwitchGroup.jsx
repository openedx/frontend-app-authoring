import React from 'react';
import PropTypes from 'prop-types';
import { Form } from '@edx/paragon';

export default function FormSwitchGroup({
  id, label, helpText, className, onChange, onBlur, checked,
}) {
  const helpTextId = `${id}HelpText`;
  return (
    <Form.Group className={className}>
      <div className="d-flex justify-content-between">
        <Form.Label>
          {label}
        </Form.Label>
        <Form.Switch
          id={id}
          aria-describedby={helpTextId}
          onChange={onChange}
          onBlur={onBlur}
          checked={checked}
        />
      </div>
      <Form.Text id={helpTextId} muted>
        {helpText}
      </Form.Text>
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
