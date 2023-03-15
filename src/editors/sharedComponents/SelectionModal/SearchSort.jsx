import React from 'react';
import PropTypes from 'prop-types';

import {
  ActionRow, Dropdown, Form, Icon, IconButton,
} from '@edx/paragon';
import { Close, Search } from '@edx/paragon/icons';
import {
  FormattedMessage,
  injectIntl,
  MessageDescriptor,
  intlShape,
} from '@edx/frontend-platform/i18n';

import messages from './messages';

export const SearchSort = ({
  searchString,
  onSearchChange,
  clearSearchString,
  sortBy,
  onSortClick,
  sortKeys,
  sortMessages,
  filterBy,
  onFilterClick,
  filterKeys,
  filterMessages,
  showSwitch,
  switchMessage,
  onSwitchClick,
  // injected
  intl,
}) => (
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
    <Dropdown>
      <Dropdown.Toggle id="gallery-sort-button" variant="tertiary">
        <FormattedMessage {...sortMessages[sortBy]} />
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {Object.keys(sortKeys).map(key => (
          <Dropdown.Item key={key} onClick={onSortClick(key)}>
            <FormattedMessage {...sortMessages[key]} />
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>

    { filterKeys && filterMessages && (
      <Dropdown>
        <Dropdown.Toggle id="gallery-filter-button" variant="tertiary">
          <FormattedMessage {...filterMessages[filterBy]} />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {Object.keys(filterKeys).map(key => (
            <Dropdown.Item key={key} onClick={onFilterClick(key)}>
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
          <Form.Switch value="switch-value" floatLabelLeft>
            <FormattedMessage {...switchMessage} />
          </Form.Switch>
        </Form.SwitchSet>
      </>
    )}

  </ActionRow>
);

SearchSort.defaultProps = {
  filterBy: '',
  onFilterClick: null,
  filterKeys: null,
  filterMessages: null,
  showSwitch: false,
  switchMessage: null,
  onSwitchClick: null,
};

SearchSort.propTypes = {
  searchString: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  clearSearchString: PropTypes.func.isRequired,
  sortBy: PropTypes.string.isRequired,
  onSortClick: PropTypes.func.isRequired,
  sortKeys: PropTypes.shape({}).isRequired,
  sortMessages: PropTypes.shape({}).isRequired,
  filterBy: PropTypes.string,
  onFilterClick: PropTypes.func,
  filterKeys: PropTypes.shape({}),
  filterMessages: PropTypes.shape({}),
  showSwitch: PropTypes.bool,
  switchMessage: MessageDescriptor,
  onSwitchClick: PropTypes.func,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(SearchSort);
