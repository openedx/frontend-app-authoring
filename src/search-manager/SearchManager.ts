/* eslint-disable react/require-default-props */
/**
 * This is a search manager that provides search functionality similar to the
 * Instantsearch library. We use it because Instantsearch doesn't support
 * multiple selections of hierarchical tags.
 * https://github.com/algolia/instantsearch/issues/1658
 */
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { MeiliSearch, type Filter } from 'meilisearch';

import { ContentHit, SearchSortOption } from './data/api';
import { useContentSearchConnection, useContentSearchResults } from './data/apiHooks';

export interface SearchContextData {
  client?: MeiliSearch;
  indexName?: string;
  searchKeywords: string;
  setSearchKeywords: React.Dispatch<React.SetStateAction<string>>;
  blockTypesFilter: string[];
  setBlockTypesFilter: React.Dispatch<React.SetStateAction<string[]>>;
  tagsFilter: string[];
  setTagsFilter: React.Dispatch<React.SetStateAction<string[]>>;
  blockTypes: Record<string, number>;
  extraFilter?: Filter;
  canClearFilters: boolean;
  clearFilters: () => void;
  searchSortOrder: SearchSortOption;
  setSearchSortOrder: React.Dispatch<React.SetStateAction<SearchSortOption>>;
  hits: ContentHit[];
  totalHits: number;
  isFetching: boolean;
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  closeSearchModal: () => void;
  hasError: boolean;
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
  const [stateValue, stateSetter] = React.useState<Type>(defaultValue);

  // The converted search parameter value takes precedence over the state value.
  const returnValue: Type = fromString(searchParams.get(paramName)) ?? stateValue ?? defaultValue;

  // Before updating the state value, update the url search parameter
  const returnSetter: React.Dispatch<React.SetStateAction<Type>> = ((value: Type) => {
    const paramValue: string = toString(value) ?? '';
    if (paramValue) {
      searchParams.set(paramName, paramValue);
    } else {
      // If no paramValue, remove it from the search params, so
      // we don't get dangling parameter values like ?paramName=
      // Another way to decide this would be to check value === defaultValue,
      // and ensure that default values are never stored in the search string.
      searchParams.delete(paramName);
    }
    setSearchParams(searchParams, { replace: true });
    return stateSetter(value);
  });

  // Return the computed value and wrapped set state function
  return [returnValue, returnSetter];
}

export const SearchContextProvider: React.FC<{
  extraFilter?: Filter;
  overrideSearchSortOrder?: SearchSortOption
  children: React.ReactNode,
  closeSearchModal?: () => void,
}> = ({ extraFilter, overrideSearchSortOrder, ...props }) => {
  const [searchKeywords, setSearchKeywords] = React.useState('');
  const [blockTypesFilter, setBlockTypesFilter] = React.useState<string[]>([]);
  const [tagsFilter, setTagsFilter] = React.useState<string[]>([]);

  // The search sort order can be set via the query string
  // E.g. ?sort=display_name:desc maps to SearchSortOption.TITLE_ZA.
  const [searchSortOrder, setSearchSortOrder] = useStateWithUrlSearchParam<SearchSortOption>(
    SearchSortOption.RELEVANCE,
    'sort',
    (value: string) => Object.values(SearchSortOption).find((enumValue) => value === `${enumValue}`),
    (value: SearchSortOption) => value.toString(),
  );
  // Note: SearchSortOption.RELEVANCE is special, it means "no custom sorting",
  // so we send it to useContentSearchResults as an empty array.
  const sort: SearchSortOption[] = (overrideSearchSortOrder && [overrideSearchSortOrder])
    || (searchSortOrder === SearchSortOption.RELEVANCE ? [] : [searchSortOrder]);

  const canClearFilters = blockTypesFilter.length > 0 || tagsFilter.length > 0;
  const clearFilters = React.useCallback(() => {
    setBlockTypesFilter([]);
    setTagsFilter([]);
  }, []);

  // Initialize a connection to Meilisearch:
  const { data: connectionDetails, isError: hasConnectionError } = useContentSearchConnection();
  const indexName = connectionDetails?.indexName;
  const client = React.useMemo(() => {
    if (connectionDetails?.apiKey === undefined || connectionDetails?.url === undefined) {
      return undefined;
    }
    return new MeiliSearch({ host: connectionDetails.url, apiKey: connectionDetails.apiKey });
  }, [connectionDetails?.apiKey, connectionDetails?.url]);

  // Run the search
  const result = useContentSearchResults({
    client,
    indexName,
    extraFilter,
    searchKeywords,
    blockTypesFilter,
    tagsFilter,
    sort,
  });

  return React.createElement(SearchContext.Provider, {
    value: {
      client,
      indexName,
      searchKeywords,
      setSearchKeywords,
      blockTypesFilter,
      setBlockTypesFilter,
      tagsFilter,
      setTagsFilter,
      extraFilter,
      canClearFilters,
      clearFilters,
      searchSortOrder,
      setSearchSortOrder,
      closeSearchModal: props.closeSearchModal ?? (() => {}),
      hasError: hasConnectionError || result.isError,
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
