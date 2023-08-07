import React from 'react';
import PropTypes from 'prop-types';

import {
  ActionRow, Form, Icon, IconButton, SelectMenu, MenuItem,
} from '@edx/paragon';
import { Close, Search } from '@edx/paragon/icons';
import {
  FormattedMessage,
  useIntl,
} from '@edx/frontend-platform/i18n';

import messages from './messages';
import MultiSelectFilterDropdown from './MultiSelectFilterDropdown';
import { sortKeys, sortMessages } from '../../containers/VideoGallery/utils';

export const SearchSort = ({
  searchString,
  onSearchChange,
  clearSearchString,
  sortBy,
  onSortClick,
  filterBy,
  onFilterClick,
  showSwitch,
  switchMessage,
  onSwitchClick,
}) => {
  const intl = useIntl();
  return (
    <ActionRow>
      <Form.Group style={{ margin: 0 }}>
        <Form.Control
          autoFocus
          onChange={onSearchChange}
          placeholder={intl.formatMessage(messages.searchPlaceholder)}
          trailingElement={
            searchString
              ? (
                <IconButton
                  alt={intl.formatMessage(messages.clearSearch)}
                  iconAs={Icon}
                  invertColors
                  isActive
                  onClick={clearSearchString}
                  size="sm"
                  src={Close}
                />
              )
              : <Icon src={Search} />
          }
          value={searchString}
        />
      </Form.Group>

      { !showSwitch && <ActionRow.Spacer /> }
      <SelectMenu variant="link">
        {Object.keys(sortKeys).map(key => (
          <MenuItem key={key} onClick={onSortClick(key)} defaultSelected={key === sortBy}>
            <FormattedMessage {...sortMessages[key]} />
          </MenuItem>
        ))}
      </SelectMenu>

      {onFilterClick && <MultiSelectFilterDropdown selected={filterBy} onSelectionChange={onFilterClick} />}

      { showSwitch && (
        <>
          <ActionRow.Spacer />
          <Form.SwitchSet
            name="switch"
            onChange={onSwitchClick}
            isInline
          >
            <Form.Switch className="text-gray-700" value="switch-value" floatLabelLeft>
              <FormattedMessage {...switchMessage} />
            </Form.Switch>
          </Form.SwitchSet>
        </>
      )}

    </ActionRow>
  );
};

SearchSort.defaultProps = {
  filterBy: '',
  onFilterClick: null,
  showSwitch: false,
  onSwitchClick: null,
};

SearchSort.propTypes = {
  searchString: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  clearSearchString: PropTypes.func.isRequired,
  sortBy: PropTypes.string.isRequired,
  onSortClick: PropTypes.func.isRequired,
  filterBy: PropTypes.arrayOf(PropTypes.string),
  onFilterClick: PropTypes.func,
  showSwitch: PropTypes.bool,
  switchMessage: PropTypes.shape({}).isRequired,
  onSwitchClick: PropTypes.func,
};

export default SearchSort;
