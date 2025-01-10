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
import { TypesFilterData, useStateOrUrlSearchParam } from './hooks';
import { useContentSearchConnection, useContentSearchResults } from './data/apiHooks';
import { getBlockType } from '../generic/key-utils';

export interface SearchContextData {
  client?: MeiliSearch;
  indexName?: string;
  searchKeywords: string;
  setSearchKeywords: React.Dispatch<React.SetStateAction<string>>;
  typesFilter: TypesFilterData;
  setTypesFilter: React.Dispatch<React.SetStateAction<TypesFilterData>>;
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
  extraFilter?: Filter,
  overrideTypesFilter?: TypesFilterData,
  overrideSearchSortOrder?: SearchSortOption
  children: React.ReactNode,
  closeSearchModal?: () => void,
  skipBlockTypeFetch?: boolean,
  skipUrlUpdate?: boolean,
}> = ({
  overrideTypesFilter,
  overrideSearchSortOrder,
  skipBlockTypeFetch,
  skipUrlUpdate,
  ...props
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

  // Block + problem types use alphanumeric plus a few other characters.
  // E.g ?type=html&type=video&type=p.multiplechoiceresponse
  const [internalTypesFilter, setTypesFilter] = useStateOrUrlSearchParam<TypesFilterData>(
    new TypesFilterData(),
    'type',
    (value: string | null) => new TypesFilterData(value),
    (value: TypesFilterData | undefined) => (value ? value.toString() : undefined),
    skipUrlUpdate,
  );
  // Callers can override the types filter when searching, but we still preserve the user's selected state.
  const typesFilter = overrideTypesFilter ?? internalTypesFilter;

  // Tags can be almost any string value (see openedx-learning's RESERVED_TAG_CHARS)
  // and multiple tags may be selected together.
  // E.g ?tag=Skills+>+Abilities&tag=Skills+>+Knowledge
  const sanitizeTag = (value: string | null | undefined): string | undefined => (
    (value && /^[^\t;]+$/.test(value)) ? value : undefined
  );
  const [tagsFilter, setTagsFilter] = useStateOrUrlSearchParam<string>(
    [],
    'tag',
    sanitizeTag,
    sanitizeTag,
    skipUrlUpdate,
  );

  // E.g ?usageKey=lb:OpenCraft:libA:problem:5714eb65-7c36-4eee-8ab9-a54ed5a95849
  const sanitizeUsageKey = (value: string): string | undefined => {
    try {
      if (getBlockType(value)) {
        return value;
      }
    } catch (error) {
      // Error thrown if value cannot be parsed into a library usage key.
      // Pass through to return below.
    }
    return undefined;
  };
  const [usageKey, setUsageKey] = useStateOrUrlSearchParam<string>(
    '',
    'usageKey',
    sanitizeUsageKey,
    sanitizeUsageKey,
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
    !typesFilter.isEmpty()
    || tagsFilter.length > 0
    || !!usageKey
  );
  const isFiltered = canClearFilters || (searchKeywords !== '');
  const clearFilters = React.useCallback(() => {
    setTypesFilter((types) => types.clear());
    setTagsFilter([]);
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
    blockTypesFilter: [...typesFilter.blocks],
    problemTypesFilter: [...typesFilter.problems],
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
      typesFilter,
      setTypesFilter,
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
