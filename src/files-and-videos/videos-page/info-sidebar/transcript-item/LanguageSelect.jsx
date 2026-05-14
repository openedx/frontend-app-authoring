import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Form,
  Icon,
  ModalPopup,
  Menu,
  MenuItem,
  useToggle,
} from '@openedx/paragon';
import {
  Check,
  ExpandMore,
  ExpandLess,
  Search,
} from '@openedx/paragon/icons';
import { isEmpty } from 'lodash';

const LanguageSelect = ({
  value,
  previousSelection,
  options,
  handleSelect,
  placeholderText,
  className = 'col-9 p-0',
}) => {
  const currentSelection = isEmpty(value) ? placeholderText : options[value];

  const [isOpen, , close, toggle] = useToggle();
  const [target, setTarget] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredOptions = Object.entries(options).filter(([, text]) => (
    text?.toLowerCase().includes(normalizedQuery)
  ));

  const handleClose = () => {
    setSearchQuery('');
    close();
  };

  return (
    <>
      <div className={className}>
        <Button
          variant="tertiary"
          size="sm"
          className="border border-gray-700 justify-content-between language-select-dropdown-btn"
          style={{ minWidth: '100%' }}
          id={`language-select-dropdown-${currentSelection}`}
          data-testid="language-select-dropdown"
          onClick={toggle}
          ref={setTarget}
        >
          <span className="language-select-dropdown-btn__text">{currentSelection}</span>
          <span className="language-select-dropdown-btn__divider" />
          <Icon src={isOpen ? ExpandLess : ExpandMore} />
        </Button>
      </div>
      <ModalPopup
        placement="bottom-end"
        positionRef={target}
        isOpen={isOpen}
        onClose={handleClose}
        onEscapeKey={handleClose}
      >
        <Menu
          className="language-select"
        >
          <div>
            <div className="px-2 pb-2 pt-1">
              <Form.Control
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search languages"
                controlClassName="w-100"
                floatingLabel={null}
              />
            </div>
            {filteredOptions.length === 0 && (
              <div className="px-3 py-2 small text-muted">No results</div>
            )}
            {filteredOptions.map(([valueKey, text]) => {
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
                      handleClose();
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
          <Icon src={Search} size="xs" />
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
  className: PropTypes.string,
};

export default LanguageSelect;
