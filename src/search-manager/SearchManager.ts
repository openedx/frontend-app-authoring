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

export const SearchContextProvider: React.FC<{
  extraFilter?: Filter;
  children: React.ReactNode,
  closeSearchModal?: () => void,
}> = ({ extraFilter, ...props }) => {
  const [searchKeywords, setSearchKeywords] = React.useState('');
  const [blockTypesFilter, setBlockTypesFilter] = React.useState<string[]>([]);
  const [tagsFilter, setTagsFilter] = React.useState<string[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();

  // The search sort order can be set in the query string, or the state.
  // E.g. ?sort=display_name:desc maps to SearchSortOption.TITLE_ZA.
  // TODO: generalize this approach in case we want to use it for keyword / filters too.
  const [tmpSearchSortOrder, tmpSetSearchSortOrder] = React.useState(SearchSortOption.RELEVANCE);
  const sortParam: SearchSortOption | string | undefined = searchParams.get('sort');
  const searchSortOrder = Object.values(SearchSortOption).includes(sortParam) ? sortParam : tmpSearchSortOrder;
  const setSearchSortOrder = (value: SearchSortOption) => {
    // Update the URL parameters to store the selected search option
    setSearchParams({ ...searchParams, sort: value }, { replace: true });
    tmpSetSearchSortOrder(value);
  };
  // Note: SearchSortOption.RELEVANCE is special -- it means "no custom
  // sorting", so we send it as an empty array.
  const sort = searchSortOrder === SearchSortOption.RELEVANCE ? [] : [searchSortOrder];

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
