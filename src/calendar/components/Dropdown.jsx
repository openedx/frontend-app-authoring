import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { ExpandMore } from '@openedx/paragon/icons';

const Dropdown = ({ options, onChange, value, className }) => {
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);

  const getLabel = (option) => {
    return option.label ||
      (intl && intl.formatMessage
        ? intl.formatMessage({
            id: option.messageId,
            defaultMessage: option.defaultMessage || option.messageId,
          })
        : option.defaultMessage || option.messageId);
  };

  const toggleDropdown = () => setIsOpen(prev => !prev);

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.custom-dropdown')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`custom-dropdown ${className}`}>
      <div
        className="custom-dropdown-trigger"
        onClick={toggleDropdown}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && toggleDropdown()}
      >
        {selectedOption ? getLabel(selectedOption) : intl.formatMessage({ id: 'select.placeholder', defaultMessage: 'Select...' })}
        <span className="custom-dropdown-icon">
          <ExpandMore />
        </span>
      </div>

      {isOpen && (
        <div className="custom-dropdown-menu">
          {options.map((option) => (
            <div
              key={option.value}
              className={`custom-option ${option.value === value ? 'selected' : ''}`}
              onClick={() => handleSelect(option)}
              role="option"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleSelect(option)}
            >
              {getLabel(option)}
            </div>
          ))}
        </div>
      )}
    </div>
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
