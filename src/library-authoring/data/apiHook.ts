// @ts-check
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MeiliSearch } from 'meilisearch';

import { useContentSearchConnection, useContentSearchResults } from '../../search-modal';
import { getContentLibrary } from './api';

/**
 * Hook to fetch a content library by its ID.
 */
export const useContentLibrary = (libraryId?: string) => (
  useQuery({
    queryKey: ['contentLibrary', libraryId],
    queryFn: () => getContentLibrary(libraryId),
  })
);

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
