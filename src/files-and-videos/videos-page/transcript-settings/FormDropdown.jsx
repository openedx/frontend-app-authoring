import React from 'react';
import { Dropdown, Form, Icon } from '@openedx/paragon';
import PropTypes from 'prop-types';
import { Check } from '@openedx/paragon/icons';
import { isArray, isEmpty } from 'lodash';

const FormDropdown = ({
  value,
  allowMultiple,
  options,
  handleSelect,
  placeholderText,
}) => {
  let currentSelection;
  if (isEmpty(value)) {
    currentSelection = placeholderText;
  } else {
    currentSelection = isArray(value) && value.length > 1 ? 'Multiple' : options[value];
  }

  return (
    <Dropdown
      autoClose={allowMultiple ? 'outside' : true}
    >
      <Dropdown.Toggle
        variant="teritary"
        className="border border-gray-700 justify-content-between w-100"
        id="transcript-form-dropdown"
      >
        <span className="mw-100" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {currentSelection}
        </span>
      </Dropdown.Toggle>
      <Dropdown.Menu className="m-0" style={{ maxHeight: '300px', overflowY: 'scroll' }}>
        {Object.entries(options).map(([valueKey, text]) => {
          if (allowMultiple) {
            return (
              <Dropdown.Item as={Form.Checkbox} checked={value.includes(valueKey)} onChange={(e) => handleSelect([valueKey, e.target.checked])} key={`${valueKey}-item`}>
                {text}
              </Dropdown.Item>
            );
          }
          if (valueKey === value) {
            return (
              <Dropdown.Item key={`${valueKey}-item`}>
                <Icon size="inline" src={Check} className="m-n2" /><span className="pl-3">{text}</span>
              </Dropdown.Item>
            );
          }
          return (
            <Dropdown.Item onClick={() => handleSelect(valueKey)} key={`${valueKey}-item`}>
              <span className="pl-3">{text}</span>
            </Dropdown.Item>
          );
        })}
      </Dropdown.Menu>
    </Dropdown>
  );
};

FormDropdown.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]).isRequired,
  allowMultiple: PropTypes.bool,
  options: PropTypes.shape({}).isRequired,
  handleSelect: PropTypes.func.isRequired,
  placeholderText: PropTypes.string.isRequired,
};

FormDropdown.defaultProps = {
  allowMultiple: false,
};

export default FormDropdown;
