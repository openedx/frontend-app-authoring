/* eslint-disable react/prop-types */
// @ts-check
/**
 * This is a search manager that provides search functionality similar to the
 * Instantsearch library. We use it because Instantsearch doesn't support
 * multiple selections of hierarchical tags.
 * https://github.com/algolia/instantsearch/issues/1658
 */
import React from 'react';
import { MeiliSearch } from 'meilisearch';

import { useContentSearchConnection, useContentSearchResults } from '../data/apiHooks';

/**
 * @type {React.Context<undefined|{
 *   client?: MeiliSearch,
 *   indexName?: string,
 *   searchKeywords: string,
 *   setSearchKeywords: React.Dispatch<React.SetStateAction<string>>,
 *   blockTypesFilter: string[],
 *   setBlockTypesFilter: React.Dispatch<React.SetStateAction<string[]>>,
 *   tagsFilter: string[],
 *   setTagsFilter: React.Dispatch<React.SetStateAction<string[]>>,
 *   blockTypes: Record<string, number>,
 *   extraFilter?: import('meilisearch').Filter,
 *   canClearFilters: boolean,
 *   clearFilters: () => void,
 *   hits: import('../data/api').ContentHit[],
 *   totalHits: number,
 *   isFetching: boolean,
 *   hasNextPage: boolean | undefined,
 *   isFetchingNextPage: boolean,
 *   fetchNextPage: () => void,
 *   closeSearchModal: () => void,
 *   hasError: boolean,
 * }>}
 */
const SearchContext = /** @type {any} */(React.createContext(undefined));

/**
 * @type {React.FC<{
*   extraFilter?: import('meilisearch').Filter,
*   children: React.ReactNode,
*   closeSearchModal?: () => void,
* }>}
*/
export const SearchContextProvider = ({ extraFilter, children, closeSearchModal }) => {
  const [searchKeywords, setSearchKeywords] = React.useState('');
  const [blockTypesFilter, setBlockTypesFilter] = React.useState(/** type {string[]} */([]));
  const [tagsFilter, setTagsFilter] = React.useState(/** type {string[]} */([]));

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
      closeSearchModal: closeSearchModal ?? (() => {}),
      hasError: hasConnectionError || result.isError,
      ...result,
    },
  }, children);
};

export const useSearchContext = () => {
  const ctx = React.useContext(SearchContext);
  if (ctx === undefined) {
    throw new Error('Cannot use search components outside of <SearchContextProvider>');
  }
  return ctx;
};
