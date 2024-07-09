import React, { useMemo } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from './messages';

import LibrariesV2FilterMenu from '../libraries-v2-filter-menu';

const LibrariesV2OrderFilterMenu: React.FC<{
  onItemMenuSelected: (value: string) => void;
  isFiltered: boolean;
}> = ({ onItemMenuSelected, isFiltered }) => {
  const intl = useIntl();

  const libraryV2Orders = useMemo(
    () => [
      {
        id: 'sort-libraries-v2-az',
        name: intl.formatMessage(messages.librariesV2OrderFilterMenuAscendantLibrariesV2),
        value: 'sortLibrariesV2AZ',
      },
      {
        id: 'sort-libraries-v2-za',
        name: intl.formatMessage(messages.librariesV2OrderFilterMenuDescendantLibrariesV2),
        value: 'sortLibrariesV2ZA',
      },
      {
        id: 'sort-libraries-v2-newest',
        name: intl.formatMessage(messages.librariesV2OrderFilterMenuNewestLibrariesV2),
        value: 'sortLibrariesV2Newest',
      },
      {
        id: 'sort-libraries-v2-oldest',
        name: intl.formatMessage(messages.librariesV2OrderFilterMenuOldestLibrariesV2),
        value: 'sortLibrariesV2Oldest',
      },
    ],
    [intl],
  );

  const handleLibraryV2OrderSelected = (libraryV2Order: string) => {
    onItemMenuSelected(libraryV2Order);
  };

  return (
    <LibrariesV2FilterMenu
      id="dropdown-toggle-libraries-v2-order-menu"
      menuItems={libraryV2Orders}
      onItemMenuSelected={handleLibraryV2OrderSelected}
      defaultItemSelectedText={intl.formatMessage(messages.librariesV2OrderFilterMenuAscendantLibrariesV2)}
      isFiltered={isFiltered}
    />
  );
};

export default LibrariesV2OrderFilterMenu;
