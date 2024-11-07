import React from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { type Filter, MeiliSearch } from 'meilisearch';

import {
  SearchSortOption,
  TAG_SEP,
  fetchAvailableTagOptions,
  fetchSearchResults,
  fetchTagsThatMatchKeyword,
  getContentSearchConfig,
  fetchBlockTypes,
} from './api';

/**
 * Load the Meilisearch connection details from the CMS: the URL to use, the index name, and an API key specific
 * to the current user that allows it to search all content he have permission to view.
 *
 */
export const useContentSearchConnection = (): {
  client?: MeiliSearch,
  indexName?: string,
  hasConnectionError: boolean;
} => {
  const { data: connectionDetails, isError: hasConnectionError } = useQuery({
    queryKey: ['content_search'],
    queryFn: getContentSearchConfig,
    cacheTime: 60 * 60_000, // Even if we're not actively using the search modal, keep it in memory up to an hour
    staleTime: 60 * 60_000, // If cache is up to one hour old, no need to re-fetch
    refetchInterval: 60 * 60_000,
    refetchOnWindowFocus: false, // This doesn't need to be refreshed when the user switches back to this tab.
    refetchOnMount: false,
  });

  const indexName = connectionDetails?.indexName;
  const client = React.useMemo(() => {
    if (connectionDetails?.apiKey === undefined || connectionDetails?.url === undefined) {
      return undefined;
    }
    return new MeiliSearch({ host: connectionDetails.url, apiKey: connectionDetails.apiKey });
  }, [connectionDetails?.apiKey, connectionDetails?.url]);

  return { client, indexName, hasConnectionError };
};

/**
 * Get the results of a search
 */
export const useContentSearchResults = ({
  client,
  indexName,
  extraFilter,
  searchKeywords,
  blockTypesFilter = [],
  problemTypesFilter = [],
  tagsFilter = [],
  sort = [],
  skipBlockTypeFetch = false,
}: {
  /** The Meilisearch API client */
  client?: MeiliSearch;
  /** Which search index contains the content data */
  indexName?: string;
  /** Other filters to apply to the search, e.g. course ID */
  extraFilter?: Filter;
  /** The keywords that the user is searching for, if any */
  searchKeywords: string;
  /** Only search for these block types (e.g. `["html", "problem"]`) */
  blockTypesFilter?: string[];
  /** Only search for these problem types (e.g. `["choiceresponse", "multiplechoiceresponse"]`) */
  problemTypesFilter?: string[];
  /** Required tags (all must match), e.g. `["Difficulty > Hard", "Subject > Math"]` */
  tagsFilter?: string[];
  /** Sort search results using these options */
  sort?: SearchSortOption[];
  /** If true, don't fetch the block types from the server */
  skipBlockTypeFetch?: boolean;
}) => {
  const query = useInfiniteQuery({
    enabled: client !== undefined && indexName !== undefined,
    queryKey: [
      'content_search',
      'results',
      client?.config.apiKey,
      client?.config.host,
      indexName,
      extraFilter,
      searchKeywords,
      blockTypesFilter,
      problemTypesFilter,
      tagsFilter,
      sort,
    ],
    queryFn: ({ pageParam = 0 }) => {
      // istanbul ignore if: this should never happen
      if (client === undefined || indexName === undefined) {
        throw new Error('Required data unexpectedly undefined. Check "enable" condition of useQuery.');
      }
      return fetchSearchResults({
        client,
        extraFilter,
        indexName,
        searchKeywords,
        blockTypesFilter,
        problemTypesFilter,
        tagsFilter,
        sort,
        // For infinite pagination of results, we can retrieve additional pages if requested.
        // Note that if there are 20 results per page, the "second page" has offset=20, not 2.
        offset: pageParam,
        skipBlockTypeFetch,
      });
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    // Avoid flickering results when user is typing... keep old results until new is available.
    keepPreviousData: true,
    refetchOnWindowFocus: false, // This doesn't need to be refreshed when the user switches back to this tab.
  });

  const pages = query.data?.pages;
  const hits = React.useMemo(
    () => pages?.reduce((allHits, page) => [...allHits, ...page.hits], []) ?? [],
    [pages],
  );

  return {
    hits,
    // The distribution of block type filter options
    blockTypes: pages?.[0]?.blockTypes ?? {},
    problemTypes: pages?.[0]?.problemTypes ?? {},
    status: query.status,
    isLoading: query.isLoading,
    isError: query.isError,
    isFetchingNextPage: query.isFetchingNextPage,
    // Call this to load more pages. We include some "safety" features recommended by the docs: this should never be
    // called while already fetching a page, and parameters (like 'event') should not be passed into fetchNextPage().
    // See https://tanstack.com/query/v4/docs/framework/react/guides/infinite-queries
    fetchNextPage: () => { if (!query.isFetching && !query.isFetchingNextPage) { query.fetchNextPage(); } },
    hasNextPage: query.hasNextPage,
    // The last page has the most accurate count of total hits
    totalHits: pages?.[pages.length - 1]?.totalHits ?? 0,
  };
};

/**
 * Get the available tags that can be used to refine a search, based on the search filters applied so far.
 * Also the user can use a keyword search to find specific tags.
 */
export const useTagFilterOptions = (args: {
  /** The Meilisearch client instance */
  client?: MeiliSearch;
  /** Which index to search */
  indexName?: string;
  /** Overall query string for the search; may be empty */
  searchKeywords: string;
  /** Filter to only include these block types e.g. `["problem", "html"]` */
  blockTypesFilter?: string[];
  /** Any other filters to apply to the overall search. */
  extraFilter?: Filter;
  /** Only show taxonomies/tags that match these keywords */
  tagSearchKeywords?: string;
  /** Only fetch tags below this parent tag/taxonomy e.g. `"Places > North America"` */
  parentTagPath?: string;
}) => {
  const mainQuery = useQuery({
    enabled: args.client !== undefined && args.indexName !== undefined,
    queryKey: [
      'content_search',
      'tag_filter_options',
      args.client?.config.apiKey,
      args.client?.config.host,
      args.indexName,
      args.extraFilter,
      args.searchKeywords,
      args.blockTypesFilter,
      args.parentTagPath,
    ],
    queryFn: () => {
      const { client, indexName } = args;
      // istanbul ignore if: this should never happen
      if (client === undefined || indexName === undefined) {
        throw new Error('Required data unexpectedly undefined. Check "enable" condition of useQuery.');
      }
      return fetchAvailableTagOptions({ ...args, client, indexName });
    },
    // Avoid flickering results when user is typing... keep old results until new is available.
    keepPreviousData: true,
    refetchOnWindowFocus: false, // This doesn't need to be refreshed when the user switches back to this tab.
  });

  const tagKeywordSearchData = useQuery({
    enabled: args.client !== undefined && args.indexName !== undefined,
    queryKey: [
      'content_search',
      'tags_keyword_search_data',
      args.client?.config.apiKey,
      args.client?.config.host,
      args.indexName,
      args.extraFilter,
      args.blockTypesFilter,
      args.tagSearchKeywords,
    ],
    queryFn: () => {
      const { client, indexName } = args;
      // istanbul ignore if: this should never happen
      if (client === undefined || indexName === undefined) {
        throw new Error('Required data unexpectedly undefined. Check "enable" condition of useQuery.');
      }
      return fetchTagsThatMatchKeyword({ ...args, client, indexName });
    },
    // Avoid flickering results when user is typing... keep old results until new is available.
    keepPreviousData: true,
    refetchOnWindowFocus: false, // This doesn't need to be refreshed when the user switches back to this tab.
  });

  const data = React.useMemo(() => {
    if (!args.tagSearchKeywords || !tagKeywordSearchData.data) {
      // If there's no keyword search being used to filter the list of available tags, just use the results of the
      // main query.
      return { tags: mainQuery.data?.tags, mayBeMissingResults: mainQuery.data?.mayBeMissingResults ?? false };
    }
    if (mainQuery.data === undefined) {
      return { tags: undefined, mayBeMissingResults: false };
    }
    // Combine these two queries to filter the list of tags based on the keyword search.
    const tags = mainQuery.data.tags.filter(
      ({ tagPath }) => tagKeywordSearchData.data.matches.some(
        (matchingTag) => matchingTag.tagPath === tagPath || matchingTag.tagPath.startsWith(tagPath + TAG_SEP),
      ),
    );
    return {
      tags,
      mayBeMissingResults: mainQuery.data.mayBeMissingResults || tagKeywordSearchData.data.mayBeMissingResults,
    };
  }, [mainQuery.data, tagKeywordSearchData.data]);

  return { ...mainQuery, data };
};

export const useGetBlockTypes = (extraFilters: Filter) => {
  const { client, indexName } = useContentSearchConnection();
  return useQuery({
    enabled: client !== undefined && indexName !== undefined,
    queryKey: [
      'content_search',
      client?.config.apiKey,
      client?.config.host,
      indexName,
      extraFilters,
      'block_types',
    ],
    queryFn: () => fetchBlockTypes(client!, indexName!, extraFilters),
  });
};
