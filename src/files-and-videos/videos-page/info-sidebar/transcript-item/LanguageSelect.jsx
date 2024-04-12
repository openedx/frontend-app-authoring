import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Icon,
  ModalPopup,
  Menu,
  MenuItem,
  useToggle,
} from '@openedx/paragon';
import { Check, ExpandMore, ExpandLess } from '@openedx/paragon/icons';
import { isEmpty } from 'lodash';

const LanguageSelect = ({
  value,
  previousSelection,
  options,
  handleSelect,
  placeholderText,
}) => {
  const currentSelection = isEmpty(value) ? placeholderText : options[value];

  const [isOpen, , close, toggle] = useToggle();
  const [target, setTarget] = useState(null);

  return (
    <>
      <div className="col-9 p-0">
        <Button
          variant="tertiary"
          size="sm"
          className="border border-gray-700 justify-content-between"
          style={{ minWidth: '100%' }}
          id={`language-select-dropdown-${currentSelection}`}
          data-testid="language-select-dropdown"
          iconAfter={isOpen ? ExpandLess : ExpandMore}
          onClick={toggle}
          ref={setTarget}
        >
          {currentSelection}
        </Button>
      </div>
      <ModalPopup
        placement="bottom-end"
        positionRef={target}
        isOpen={isOpen}
        onClose={close}
        onEscapeKey={close}
      >
        <Menu
          className="language-select"
        >
          <div>
            {Object.entries(options).map(([valueKey, text]) => {
              if (valueKey === value) {
                return (
                  <MenuItem
                    as={Button}
                    variant="tertiary"
                    size="sm"
                    key={`${valueKey}-item`}
                  >
                    <Icon size="inline" src={Check} />
                    <span className="pl-1">{text}</span>
                  </MenuItem>
                );
              }
              if (!previousSelection.includes(valueKey)) {
                return (
                  <MenuItem
                    as={Button}
                    variant="tertiary"
                    size="sm"
                    onClick={() => {
                      handleSelect(valueKey);
                      close();
                    }}
                    key={`${valueKey}-item`}
                  >
                    <span className="pl-3">{text}</span>
                  </MenuItem>
                );
              }
              return (
                <MenuItem
                  disabled
                  variant="tertiary"
                  as={Button}
                  size="sm"
                  key={`${valueKey}-item`}
                >
                  <span className="pl-3">{text}</span>
                </MenuItem>
              );
            })}
          </div>
        </Menu>
        <div className="row justify-content-center">
          <Icon src={ExpandMore} size="xs" />
        </div>
      </ModalPopup>
    </>
  );
};

LanguageSelect.propTypes = {
  value: PropTypes.string.isRequired,
  options: PropTypes.shape({}).isRequired,
  handleSelect: PropTypes.func.isRequired,
  placeholderText: PropTypes.string.isRequired,
  previousSelection: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default LanguageSelect;
