import React from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Dropdown, DropdownToggle, Form } from '@edx/paragon';

import PropTypes from 'prop-types';
import { filterKeys, filterMessages } from '../../containers/VideoGallery/utils';

const MultiSelectFilterDropdown = ({
  selected, onSelectionChange,
}) => {
  const intl = useIntl();
  return (
    <Dropdown autoClose={false}>
      <DropdownToggle variant="outline" id="gallery-filter">
        {intl.formatMessage(filterMessages.title)}
      </DropdownToggle>
      <Dropdown.Menu renderOnMount className="p-2">
        {Object.keys(filterKeys).map(key => (
          <Dropdown.Item
            key={key}
            as={Form.Checkbox}
            checked={selected.includes(key)}
            onChange={onSelectionChange(key)}
          >
            <span className="p-1">{intl.formatMessage(filterMessages[key])}</span>
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

MultiSelectFilterDropdown.propTypes = {
  selected: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSelectionChange: PropTypes.func.isRequired,
};
export default MultiSelectFilterDropdown;
