/**
 * This is a search manager that provides search functionality similar to the
 * Instantsearch library. We use it because Instantsearch doesn't support
 * multiple selections of hierarchical tags.
 * https://github.com/algolia/instantsearch/issues/1658
 */
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { MeiliSearch, type Filter } from 'meilisearch';
import { union } from 'lodash';

import {
  CollectionHit, ContentHit, SearchSortOption, forceArray,
} from './data/api';
import { useContentSearchConnection, useContentSearchResults } from './data/apiHooks';

export interface SearchContextData {
  client?: MeiliSearch;
  indexName?: string;
  searchKeywords: string;
  setSearchKeywords: React.Dispatch<React.SetStateAction<string>>;
  blockTypesFilter: string[];
  setBlockTypesFilter: React.Dispatch<React.SetStateAction<string[]>>;
  problemTypesFilter: string[];
  setProblemTypesFilter: React.Dispatch<React.SetStateAction<string[]>>;
  tagsFilter: string[];
  setTagsFilter: React.Dispatch<React.SetStateAction<string[]>>;
  blockTypes: Record<string, number>;
  problemTypes: Record<string, number>;
  extraFilter?: Filter;
  canClearFilters: boolean;
  clearFilters: () => void;
  isFiltered: boolean;
  searchSortOrder: SearchSortOption;
  setSearchSortOrder: React.Dispatch<React.SetStateAction<SearchSortOption>>;
  defaultSearchSortOrder: SearchSortOption;
  hits: (ContentHit | CollectionHit)[];
  totalHits: number;
  isLoading: boolean;
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  closeSearchModal: () => void;
  hasError: boolean;
  usageKey: string;
}

const SearchContext = React.createContext<SearchContextData | undefined>(undefined);

/**
 * Hook which lets you store state variables in the URL search parameters.
 *
 * It wraps useState with functions that get/set a query string
 * search parameter when returning/setting the state variable.
 *
 */
function useStateWithUrlSearchParam<Type>(
  defaultValue: Type,
  paramName: string,
  // Returns the Type equivalent of the given string value, or
  // undefined if value is invalid.
  fromString: (value: string | null) => Type | undefined,
  // Returns the string equivalent of the given Type value.
  // Returning empty string/undefined will clear the url search paramName.
  toString: (value: Type) => string | undefined,
): [value: Type, setter: React.Dispatch<React.SetStateAction<Type>>] {
  const [searchParams, setSearchParams] = useSearchParams();
  // The converted search parameter value takes precedence over the state value.
  const returnValue: Type = fromString(searchParams.get(paramName)) ?? defaultValue;
  // Function to update the url search parameter
  const returnSetter: React.Dispatch<React.SetStateAction<Type>> = React.useCallback((value: Type) => {
    setSearchParams((prevParams) => {
      const paramValue: string = toString(value) ?? '';
      const newSearchParams = new URLSearchParams(prevParams);
      // If using the default paramValue, remove it from the search params.
      if (paramValue === defaultValue) {
        newSearchParams.delete(paramName);
      } else {
        newSearchParams.set(paramName, paramValue);
      }
      return newSearchParams;
    }, { replace: true });
  }, [setSearchParams]);

  // Return the computed value and wrapped set state function
  return [returnValue, returnSetter];
}

export const SearchContextProvider: React.FC<{
  extraFilter?: Filter;
  overrideSearchSortOrder?: SearchSortOption
  children: React.ReactNode,
  closeSearchModal?: () => void,
  skipBlockTypeFetch?: boolean,
  skipUrlUpdate?: boolean,
}> = ({
  overrideSearchSortOrder, skipBlockTypeFetch, skipUrlUpdate, ...props
}) => {
  const [searchKeywords, setSearchKeywords] = React.useState('');
  const [blockTypesFilter, setBlockTypesFilter] = React.useState<string[]>([]);
  const [problemTypesFilter, setProblemTypesFilter] = React.useState<string[]>([]);
  const [tagsFilter, setTagsFilter] = React.useState<string[]>([]);
  const [usageKey, setUsageKey] = useStateWithUrlSearchParam(
    '',
    'usageKey',
    (value: string) => value,
    (value: string) => value,
  );

  let extraFilter: string[] = forceArray(props.extraFilter);
  if (usageKey) {
    extraFilter = union(extraFilter, [`usage_key = "${usageKey}"`]);
  }

  // The search sort order can be set via the query string
  // E.g. ?sort=display_name:desc maps to SearchSortOption.TITLE_ZA.
  // Default sort by Most Relevant if there's search keyword(s), else by Recently Modified.
  const defaultSearchSortOrder = searchKeywords ? SearchSortOption.RELEVANCE : SearchSortOption.RECENTLY_MODIFIED;
  let sortStateManager = React.useState<SearchSortOption>(defaultSearchSortOrder);
  const sortUrlStateManager = useStateWithUrlSearchParam<SearchSortOption>(
    defaultSearchSortOrder,
    'sort',
    (value: string) => Object.values(SearchSortOption).find((enumValue) => value === enumValue),
    (value: SearchSortOption) => value.toString(),
  );
  if (!skipUrlUpdate) {
    sortStateManager = sortUrlStateManager;
  }
  const [searchSortOrder, setSearchSortOrder] = sortStateManager;
  // SearchSortOption.RELEVANCE is special, it means "no custom sorting", so we
  // send it to useContentSearchResults as an empty array.
  const searchSortOrderToUse = overrideSearchSortOrder ?? searchSortOrder;
  const sort: SearchSortOption[] = (searchSortOrderToUse === SearchSortOption.RELEVANCE ? [] : [searchSortOrderToUse]);
  // Selecting SearchSortOption.RECENTLY_PUBLISHED also excludes unpublished components.
  if (searchSortOrderToUse === SearchSortOption.RECENTLY_PUBLISHED) {
    extraFilter = union(extraFilter, ['last_published IS NOT NULL']);
  }

  const canClearFilters = (
    blockTypesFilter.length > 0
    || problemTypesFilter.length > 0
    || tagsFilter.length > 0
    || !!usageKey
  );
  const isFiltered = canClearFilters || (searchKeywords !== '');
  const clearFilters = React.useCallback(() => {
    setBlockTypesFilter([]);
    setTagsFilter([]);
    setProblemTypesFilter([]);
    if (usageKey !== '') {
      setUsageKey('');
    }
  }, []);

  // Initialize a connection to Meilisearch:
  const { client, indexName, hasConnectionError } = useContentSearchConnection();

  // Run the search
  const result = useContentSearchResults({
    client,
    indexName,
    extraFilter,
    searchKeywords,
    blockTypesFilter,
    problemTypesFilter,
    tagsFilter,
    sort,
    skipBlockTypeFetch,
  });

  return React.createElement(SearchContext.Provider, {
    value: {
      client,
      indexName,
      searchKeywords,
      setSearchKeywords,
      blockTypesFilter,
      setBlockTypesFilter,
      problemTypesFilter,
      setProblemTypesFilter,
      tagsFilter,
      setTagsFilter,
      extraFilter,
      isFiltered,
      canClearFilters,
      clearFilters,
      searchSortOrder,
      setSearchSortOrder,
      defaultSearchSortOrder,
      closeSearchModal: props.closeSearchModal ?? (() => { }),
      hasError: hasConnectionError || result.isError,
      usageKey,
      ...result,
    },
  }, props.children);
};

export const useSearchContext = () => {
  const ctx = React.useContext(SearchContext);
  if (ctx === undefined) {
    throw new Error('Cannot use search components outside of <SearchContextProvider>');
  }
  return ctx;
};
