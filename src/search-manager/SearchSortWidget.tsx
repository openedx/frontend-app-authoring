import React, { useMemo } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, Dropdown } from '@openedx/paragon';
import { Check, SwapVert } from '@openedx/paragon/icons';

import messages from './messages';
import { SearchSortOption } from './data/api';
import { useSearchContext } from './SearchManager';

export const SearchSortWidget: React.FC<Record<never, never>> = () => {
  const intl = useIntl();
  const menuItems = useMemo(
    () => [
      {
        id: 'search-sort-option-title-az',
        name: intl.formatMessage(messages.searchSortTitleAZ),
        value: SearchSortOption.TITLE_AZ,
      },
      {
        id: 'search-sort-option-title-za',
        name: intl.formatMessage(messages.searchSortTitleZA),
        value: SearchSortOption.TITLE_ZA,
      },
      {
        id: 'search-sort-option-newest',
        name: intl.formatMessage(messages.searchSortNewest),
        value: SearchSortOption.NEWEST,
      },
      {
        id: 'search-sort-option-oldest',
        name: intl.formatMessage(messages.searchSortOldest),
        value: SearchSortOption.OLDEST,
      },
      {
        id: 'search-sort-option-recently-published',
        name: intl.formatMessage(messages.searchSortRecentlyPublished),
        value: SearchSortOption.RECENTLY_PUBLISHED,
      },
      {
        id: 'search-sort-option-recently-modified',
        name: intl.formatMessage(messages.searchSortRecentlyModified),
        value: SearchSortOption.RECENTLY_MODIFIED,
      },
    ],
    [intl],
  );

  const { searchSortOrder, setSearchSortOrder } = useSearchContext();
  const selectedSortOption = menuItems.find((menuItem) => menuItem.value === searchSortOrder);
  const searchSortLabel = (
    selectedSortOption ? selectedSortOption.name : intl.formatMessage(messages.searchSortWidgetLabel)
  );

  return (
    <Dropdown id="search-sort-dropdown">
      <Dropdown.Toggle
        id="search-sort-toggle"
        title={intl.formatMessage(messages.searchSortWidgetAltTitle)}
        alt={intl.formatMessage(messages.searchSortWidgetAltTitle)}
        variant="outline-primary"
        className="dropdown-toggle-menu-items d-flex"
        size="sm"
      >
        <Icon src={SwapVert} className="d-inline" />
        {searchSortLabel}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {menuItems.map(({ id, name, value }) => (
          <Dropdown.Item
            key={id}
            onClick={() => setSearchSortOrder(value)}
          >
            {name}
            {(value === searchSortOrder) && <Icon src={Check} className="ml-2" />}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default SearchSortWidget;
