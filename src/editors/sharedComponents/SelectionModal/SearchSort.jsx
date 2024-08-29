import React from 'react';
import PropTypes from 'prop-types';

import {
  ActionRow, Dropdown, Form, Icon, IconButton, SelectMenu, MenuItem,
} from '@openedx/paragon';
import { Check, Close, Search } from '@openedx/paragon/icons';
import {
  FormattedMessage,
  useIntl,
} from '@edx/frontend-platform/i18n';

import messages from './messages';
import './index.scss';
import { sortKeys, sortMessages } from '../../containers/VideoGallery/utils';

const SearchSort = ({
  searchString,
  onSearchChange,
  clearSearchString,
  sortBy,
  onSortClick,
  filterBy,
  onFilterClick,
  filterKeys,
  filterMessages,
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
      <SelectMenu variant="link" className="search-sort-menu">
        {Object.keys(sortKeys).map(key => (
          <MenuItem
            key={key}
            onClick={onSortClick(key)}
            defaultSelected={key === sortBy}
            iconAfter={(key === sortBy) ? Check : null}
          >
            <span className="search-sort-menu-by">
              <FormattedMessage {...messages.sortBy} />
              <span style={{ whiteSpace: 'pre-wrap' }}> </span>
            </span>
            <FormattedMessage {...sortMessages[key]} />
          </MenuItem>
        ))}
      </SelectMenu>

      { onFilterClick && (
      <Dropdown>
        <Dropdown.Toggle
          data-testid="dropdown-filter"
          className="text-gray-700"
          id="gallery-filter-button"
          variant="tertiary"
        >
          <FormattedMessage {...filterMessages[filterBy]} />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {Object.keys(filterKeys).map(key => (
            <Dropdown.Item data-testid={`dropdown-filter-${key}`} key={key} onClick={onFilterClick(key)}>
              <FormattedMessage {...filterMessages[key]} />
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
      )}

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
  filterKeys: null,
  filterMessages: null,
  showSwitch: false,
  onSwitchClick: null,
};

SearchSort.propTypes = {
  searchString: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  clearSearchString: PropTypes.func.isRequired,
  sortBy: PropTypes.string.isRequired,
  onSortClick: PropTypes.func.isRequired,
  filterBy: PropTypes.string,
  onFilterClick: PropTypes.func,
  filterKeys: PropTypes.shape({}),
  filterMessages: PropTypes.shape({}),
  showSwitch: PropTypes.bool,
  switchMessage: PropTypes.shape({}).isRequired,
  onSwitchClick: PropTypes.func,
};

export default SearchSort;
