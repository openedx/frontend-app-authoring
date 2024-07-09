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
        // Default; sorts results by keyword search ranking
        id: 'sort-content-relevance',
        name: intl.formatMessage(messages.searchSortRelevance),
        value: SearchSortOption.RELEVANCE,
      },
      {
        id: 'sort-content-title-az',
        name: intl.formatMessage(messages.searchSortTitleAZ),
        value: SearchSortOption.TITLE_AZ,
      },
      {
        id: 'sort-content-title-za',
        name: intl.formatMessage(messages.searchSortTitleZA),
        value: SearchSortOption.TITLE_ZA,
      },
      {
        id: 'sort-content-newest',
        name: intl.formatMessage(messages.searchSortNewest),
        value: SearchSortOption.NEWEST,
      },
      {
        id: 'sort-content-oldest',
        name: intl.formatMessage(messages.searchSortOldest),
        value: SearchSortOption.OLDEST,
      },
      {
        id: 'sort-content-recently-published',
        name: intl.formatMessage(messages.searchSortRecentlyPublished),
        value: SearchSortOption.RECENTLY_PUBLISHED,
      },
      {
        id: 'sort-content-recently-modified',
        name: intl.formatMessage(messages.searchSortRecentlyModified),
        value: SearchSortOption.RECENTLY_MODIFIED,
      },
    ],
    [intl],
  );

  const { searchSortOrder, setSearchSortOrder } = useSearchContext();
  const searchSortLabel = (
    menuItems.find((menuItem) => menuItem.value === searchSortOrder)
    ?? menuItems[0]
  ).name;

  return (
    <Dropdown>
      <Dropdown.Toggle
        title={intl.formatMessage(messages.searchSortWidgetAltTitle)}
        variant="none"
        className="dropdown-toggle-menu-items form-control d-flex"
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
