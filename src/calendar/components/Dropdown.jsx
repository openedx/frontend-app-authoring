import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';

const Dropdown = ({ options, onChange, value, className }) => {
  const  intl  = useIntl();

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <select
      className={className}
      onChange={handleChange}
      value={value}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label ||
            (intl && intl.formatMessage
              ? intl.formatMessage({
                  id: option.messageId,
                  defaultMessage: option.defaultMessage || option.messageId,
                })
              : option.defaultMessage || option.messageId)}
        </option>
      ))}
    </select>
  );
};

Dropdown.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      messageId: PropTypes.string,
      defaultMessage: PropTypes.string,
      label: PropTypes.string,
    })
  ).isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string,
  className: PropTypes.string,
};

Dropdown.defaultProps = {
  value: undefined,
  className: '',
};

export default Dropdown;