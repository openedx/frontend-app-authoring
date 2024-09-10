import React, { useState, useCallback, useEffect } from 'react';
import { SearchField } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { LoadingSpinner } from '../../../../generic/Loading';
import LibrariesV2OrderFilterMenu from './libraries-v2-order-filter-menu';
import messages from '../../messages';

export interface LibrariesV2FiltersProps {
  isLoading?: boolean;
  isFiltered?: boolean;
  filterParams: { search?: string | undefined, order?: string };
  setFilterParams: React.Dispatch<React.SetStateAction<{ search: string | undefined, order: string }>>;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

const LibrariesV2Filters: React.FC<LibrariesV2FiltersProps> = ({
  isLoading = false,
  isFiltered = false,
  filterParams,
  setFilterParams,
  setCurrentPage,
}) => {
  const intl = useIntl();

  const [search, setSearch] = useState<string | undefined>('');
  const [order, setOrder] = useState('title');

  // Reset search & order when filters cleared
  useEffect(() => {
    if (!isFiltered) {
      setSearch(filterParams.search);
      setOrder('title');
    }
  }, [isFiltered, setSearch, search, setOrder, filterParams.search]);

  const getOrderFromFilterType = (filterType: string) => {
    const orders = {
      sortLibrariesV2AZ: 'title',
      sortLibrariesV2ZA: '-title',
      sortLibrariesV2Newest: '-created',
      sortLibrariesV2Oldest: 'created',
    };

    // Default to 'A-Z` if invalid filtertype
    return orders[filterType] || 'title';
  };

  const getFilterTypeData = (baseFilters: { search: string | undefined; order: string; }) => ({
    sortLibrariesV2AZ: { ...baseFilters, order: 'title' },
    sortLibrariesV2ZA: { ...baseFilters, order: '-title' },
    sortLibrariesV2Newest: { ...baseFilters, order: '-created' },
    sortLibrariesV2Oldest: { ...baseFilters, order: 'created' },
  });

  const handleMenuFilterItemSelected = (filterType: string) => {
    setOrder(getOrderFromFilterType(filterType));

    const baseFilters = {
      search,
      order,
    };

    const menuFilterParams = getFilterTypeData(baseFilters);
    const filterParamsFormat = menuFilterParams[filterType] || baseFilters;

    setFilterParams(filterParamsFormat);
    setCurrentPage(1);
  };

  const handleSearchLibrariesV2 = useCallback((searchValue: string) => {
    const valueFormatted = searchValue.trim();
    const updatedFilterParams = {
      search: valueFormatted.length > 0 ? valueFormatted : undefined,
      order,
    };

    // Check if the search is different from the current search and it's not only spaces
    if (valueFormatted !== search || valueFormatted) {
      setSearch(valueFormatted);
      setFilterParams(updatedFilterParams);
      setCurrentPage(1);
    }
  }, [order, search]);

  return (
    <div className="d-flex">
      <div className="d-flex flex-row">
        <SearchField
          onSubmit={() => {}}
          onChange={handleSearchLibrariesV2}
          value={search}
          className="mr-4"
          placeholder={intl.formatMessage(messages.librariesV2TabLibrarySearchPlaceholder)}
        />
        {isLoading && (
          <span className="search-field-loading">
            <LoadingSpinner size="sm" />
          </span>
        )}
      </div>

      <LibrariesV2OrderFilterMenu onItemMenuSelected={handleMenuFilterItemSelected} isFiltered={isFiltered} />
    </div>
  );
};

export default LibrariesV2Filters;
