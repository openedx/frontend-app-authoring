import { useQuery } from '@tanstack/react-query';

import { getContentLibrary, getLibraryBlockTypes } from './api';

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
 *  Hook to fetch block types of a library.
 */
export const useLibraryBlockTypes = (libraryId?: string) => (
  useQuery({
    queryKey: ['contentLibrary', 'libraryBlockTypes', libraryId],
    queryFn: () => getLibraryBlockTypes(libraryId),
  })
);
