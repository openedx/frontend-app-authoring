/**
 * This is a search manager that provides search functionality similar to the
 * Instantsearch library. We use it because Instantsearch doesn't support
 * multiple selections of hierarchical tags.
 * https://github.com/algolia/instantsearch/issues/1658
 */
import React from 'react';
import { MeiliSearch, type Filter } from 'meilisearch';
import { union } from 'lodash';

import {
  CollectionHit, ContentHit, SearchSortOption, forceArray,
} from './data/api';
import { useContentSearchConnection, useContentSearchResults } from './data/apiHooks';
import {
  type FromStringFn,
  type ToStringFn,
  useListHelpers,
  useStateWithUrlSearchParam,
} from '../hooks';

/**
 * Typed hook that returns useState if skipUrlUpdate,
 * or useStateWithUrlSearchParam if it's not.
 *
 * Provided here to reduce some code overhead in SearchManager.
 */
function useStateOrUrlSearchParam<Type>(
  defaultValue: Type,
  paramName: string,
  fromString: FromStringFn<Type>,
  toString: ToStringFn<Type>,
  skipUrlUpdate?: boolean,
): [value: Type, setter: React.Dispatch<React.SetStateAction<Type>>] {
  const useStateManager = React.useState<Type>(defaultValue);
  const urlStateManager = useStateWithUrlSearchParam<Type>(
    defaultValue,
    paramName,
    fromString,
    toString,
  );
  return skipUrlUpdate ? useStateManager : urlStateManager;
}

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
  // Search parameters can be set via the query string
  // E.g. ?q=draft+text
  // TODO -- how to sanitize search terms?
  const [searchKeywords, setSearchKeywords] = useStateOrUrlSearchParam<string>(
    '',
    'q',
    (value: string) => value || '',
    (value: string) => value || '',
    skipUrlUpdate,
  );

  const [blockTypesFilter, setBlockTypesFilter] = React.useState<string[]>([]);
  const [problemTypesFilter, setProblemTypesFilter] = React.useState<string[]>([]);
  // Tags can be almost any string value, except our separator (|)
  // TODO how to sanitize tags?
  // E.g ?tags=Skills+>+Abilities|Skills+>+Knowledge
  const sanitizeTag = (value: string | null | undefined): string | undefined => (
    (value && /^[^|]+$/.test(value))
      ? value
      : undefined
  );
  const [tagToList, listToTag] = useListHelpers<string>({
    toString: sanitizeTag,
    fromString: sanitizeTag,
    separator: '|',
  });
  const [tagsFilter, setTagsFilter] = useStateOrUrlSearchParam<string[]>(
    [],
    'tags',
    tagToList,
    listToTag,
    skipUrlUpdate,
  );

  // E.g ?usageKey=lb:OpenCraft:libA:problem:5714eb65-7c36-4eee-8ab9-a54ed5a95849
  const [usageKey, setUsageKey] = useStateOrUrlSearchParam<string>(
    '',
    'usageKey',
    // TODO should sanitize usageKeys too.
    (value: string) => value,
    (value: string) => value,
    skipUrlUpdate,
  );

  let extraFilter: string[] = forceArray(props.extraFilter);
  if (usageKey) {
    extraFilter = union(extraFilter, [`usage_key = "${usageKey}"`]);
  }

  // Default sort by Most Relevant if there's search keyword(s), else by Recently Modified.
  const defaultSearchSortOrder = searchKeywords ? SearchSortOption.RELEVANCE : SearchSortOption.RECENTLY_MODIFIED;
  const [searchSortOrder, setSearchSortOrder] = useStateOrUrlSearchParam<SearchSortOption>(
    defaultSearchSortOrder,
    'sort',
    (value: string) => Object.values(SearchSortOption).find((enumValue) => value === enumValue),
    (value: SearchSortOption) => value.toString(),
    skipUrlUpdate,
  );
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
