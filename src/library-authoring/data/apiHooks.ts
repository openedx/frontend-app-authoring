import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MeiliSearch } from 'meilisearch';

import { useContentSearchConnection, useContentSearchResults } from '../../search-modal';
import {
  type GetLibrariesV2CustomParams,
  getContentLibrary,
  getLibraryBlockTypes,
  createLibraryBlock,
  getContentLibraryV2List,
} from './api';

export const libraryAuthoringQueryKeys = {
  all: ['contentLibrary'],
  /**
   * Base key for data specific to a contentLibrary
   */
  contentLibrary: (contentLibraryId?: string) => [...libraryAuthoringQueryKeys.all, contentLibraryId],
  contentLibraryList: (customParams?: GetLibrariesV2CustomParams) => [
    ...libraryAuthoringQueryKeys.all,
    'list',
    ...(customParams ? [customParams] : []),
  ],
  contentLibraryBlockTypes: (contentLibraryId?: string) => [
    ...libraryAuthoringQueryKeys.all,
    ...libraryAuthoringQueryKeys.contentLibrary(contentLibraryId),
    'content',
    'libraryBlockTypes',
  ],
};

/**
 * Hook to fetch a content library by its ID.
 */
export const useContentLibrary = (libraryId?: string) => (
  useQuery({
    queryKey: libraryAuthoringQueryKeys.contentLibrary(libraryId),
    queryFn: () => getContentLibrary(libraryId),
  })
);

/**
 *  Hook to fetch block types of a library.
 */
export const useLibraryBlockTypes = (libraryId) => (
  useQuery({
    queryKey: libraryAuthoringQueryKeys.contentLibraryBlockTypes(libraryId),
    queryFn: () => getLibraryBlockTypes(libraryId),
  })
);

/**
 * Hook to fetch components in a library.
 */
export const useLibraryComponents = (libraryId: string, searchKeywords: string) => {
  const { data: connectionDetails } = useContentSearchConnection();

  const indexName = connectionDetails?.indexName;
  const client = React.useMemo(() => {
    if (connectionDetails?.apiKey === undefined || connectionDetails?.url === undefined) {
      return undefined;
    }
    return new MeiliSearch({ host: connectionDetails.url, apiKey: connectionDetails.apiKey });
  }, [connectionDetails?.apiKey, connectionDetails?.url]);

  const libFilter = `context_key = "${libraryId}"`;

  return useContentSearchResults({
    client,
    indexName,
    searchKeywords,
    extraFilter: [libFilter],
  });
};

/**
 * Use this mutation to create a block in a library
 */
export const useCreateLibraryBlock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLibraryBlock,
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: libraryAuthoringQueryKeys.contentLibrary(variables.libraryId) });
      queryClient.invalidateQueries({ queryKey: ['content_search'] });
    },
  });
};

/**
 * Hook to fetch the count of components and collections in a library.
 */
export const useLibraryComponentCount = (libraryId: string, searchKeywords: string) => {
  // Meilisearch code to get Collection and Component counts
  const { data: connectionDetails } = useContentSearchConnection();

  const indexName = connectionDetails?.indexName;
  const client = React.useMemo(() => {
    if (connectionDetails?.apiKey === undefined || connectionDetails?.url === undefined) {
      return undefined;
    }
    return new MeiliSearch({ host: connectionDetails.url, apiKey: connectionDetails.apiKey });
  }, [connectionDetails?.apiKey, connectionDetails?.url]);

  const libFilter = `context_key = "${libraryId}"`;

  const { totalHits: componentCount } = useContentSearchResults({
    client,
    indexName,
    searchKeywords,
    extraFilter: [libFilter], // ToDo: Add filter for components when collection is implemented
  });

  const collectionCount = 0; // ToDo: Implement collections count

  return {
    componentCount,
    collectionCount,
  };
};

/**
 * Builds the query to fetch list of V2 Libraries
 */
export const useContentLibraryV2List = (customParams: GetLibrariesV2CustomParams) => (
  useQuery({
    queryKey: libraryAuthoringQueryKeys.contentLibraryList(customParams),
    queryFn: () => getContentLibraryV2List(customParams),
    keepPreviousData: true,
  })
);
