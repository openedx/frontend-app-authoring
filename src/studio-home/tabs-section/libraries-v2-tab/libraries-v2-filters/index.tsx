/* eslint-disable react/require-default-props */
import React, { useState, useCallback, useEffect } from 'react';
import { SearchField } from '@openedx/paragon';
import { debounce } from 'lodash';

import { LoadingSpinner } from '../../../../generic/Loading';
import LibrariesV2OrderFilterMenu from './libraries-v2-order-filter-menu';

/* regex to check if a string has only whitespace
  example "    "
*/
const regexOnlyWhiteSpaces = /^\s+$/;

export interface LibrariesV2FiltersProps {
  isLoading?: boolean;
  isFiltered?: boolean;
  setIsFiltered: React.Dispatch<React.SetStateAction<boolean>>;
  setFilterParams: React.Dispatch<React.SetStateAction<{ search: string | undefined, order: string }>>;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

const LibrariesV2Filters: React.FC<LibrariesV2FiltersProps> = ({
  isLoading = false,
  isFiltered = false,
  setIsFiltered,
  setFilterParams,
  setCurrentPage,
}) => {
  const [search, setSearch] = useState('');
  const [order, setOrder] = useState('title');

  // Reset search & order when filters cleared
  useEffect(() => {
    if (!isFiltered) {
      setSearch('');
      setOrder('title');
    }
  }, [isFiltered, setSearch, setOrder]);

  const getOrderFromFilterType = (filterType: string) => {
    const orders = {
      azLibrariesV2: 'title',
      zaLibrariesV2: '-title',
      newestLibrariesV2: '-created',
      oldestLibrariesV2: 'created',
    };

    // Default to 'A-Z` if invalid filtertype
    return orders[filterType] || 'title';
  };

  const getFilterTypeData = (baseFilters: { search: string | undefined; order: string; }) => ({
    azLibrariesV2: { ...baseFilters, order: 'title' },
    zaLibrariesV2: { ...baseFilters, order: '-title' },
    newestLibrariesV2: { ...baseFilters, order: '-created' },
    oldestLibrariesV2: { ...baseFilters, order: 'created' },
  });

  const handleMenuFilterItemSelected = (filterType: string) => {
    setOrder(getOrderFromFilterType(filterType));
    setIsFiltered(true);

    const baseFilters = {
      search,
      order,
    };

    const filterParams = getFilterTypeData(baseFilters);
    const filterParamsFormat = filterParams[filterType] || baseFilters;

    setFilterParams(filterParamsFormat);
    setCurrentPage(1);
  };

  const handleSearchLibrariesV2 = (searchValueDebounced: string) => {
    const valueFormatted = searchValueDebounced.trim();
    const filterParams = {
      search: valueFormatted.length > 0 ? valueFormatted : undefined,
      order,
    };
    const hasOnlySpaces = regexOnlyWhiteSpaces.test(searchValueDebounced);
    if (valueFormatted !== search && !hasOnlySpaces) {
      setIsFiltered(true);
      setSearch(valueFormatted);
      setFilterParams(filterParams);
      setCurrentPage(1);
    }
  };

  const handleSearchLibrariesV2Debounced = useCallback(
    debounce((value: string) => handleSearchLibrariesV2(value), 400),
    [order, search],
  );

  return (
    <div className="d-flex">
      <div className="d-flex flex-row">
        <SearchField
          onSubmit={() => {}}
          onChange={handleSearchLibrariesV2Debounced}
          value={search}
          className="mr-4"
          data-testid="input-filter-libraries-v2-search"
          placeholder="Search"
        />
        {isLoading && (
          <span className="search-field-loading" data-testid="loading-search-spinner">
            <LoadingSpinner size="sm" />
          </span>
        )}
      </div>

      <LibrariesV2OrderFilterMenu onItemMenuSelected={handleMenuFilterItemSelected} isFiltered={isFiltered} />
    </div>
  );
};

export default LibrariesV2Filters;
