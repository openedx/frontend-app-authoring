import React from 'react';
import {
  Badge,
  Button,
  Dropdown,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from './messages';

/**
 * A button that represents a filter on the search.
 * If the filter is active, the button displays the currently applied values.
 * So when no filter is active it may look like:
 *  [ Type ▼ ]
 * Or when a filter is active and limited to two values, it may look like:
 *  [ Type: HTML, +1 ▼ ]
 *
 * When clicked, the button will display a dropdown menu containing this
 * element's `children`. So use this to wrap a <RefinementList> etc.
 */
const SearchFilterWidget: React.FC<{
  appliedFilters: { label: React.ReactNode }[];
  label: React.ReactNode;
  children: React.ReactNode;
  clearFilter: () => void,
  icon: React.ComponentType;
}> = ({
  appliedFilters, children, clearFilter, ...props
}) => {
  const intl = useIntl();

  return (
    <div className="d-flex mr-3">
      <Dropdown id={`search-filter-dropdown-${String(props.label).toLowerCase().replace(/\s+/g, '-')}`}>
        <Dropdown.Toggle
          variant={appliedFilters.length ? 'light' : 'outline-primary'}
          size="sm"
          iconBefore={props.icon}
        >
          {props.label}
          {appliedFilters.length >= 1 ? <>: {appliedFilters[0].label}</> : null}
          {appliedFilters.length > 1 ? <>,&nbsp;<Badge variant="secondary">+{appliedFilters.length - 1}</Badge></> : null}
        </Dropdown.Toggle>
        <Dropdown.Menu
          className="bg-white rounded shadow"
          style={{ textAlign: 'start' }}
        >
          {children}

          {!!appliedFilters.length && (
          <div className="d-flex justify-content-end">
            <Button
              onClick={clearFilter}
              variant="link"
              className="text-info-500 text-decoration-none clear-filter-button"
            >
              { intl.formatMessage(messages.clearFilter) }
            </Button>
          </div>
          )}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default SearchFilterWidget;
