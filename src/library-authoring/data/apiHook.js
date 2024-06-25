// @ts-check
import { useQuery } from '@tanstack/react-query';

import { getContentLibrary, getLibraryBlockTypes } from './api';

/**
 * Hook to fetch a content library by its ID.
 * @param {string} [libraryId] - The ID of the library to fetch.
 */
export const useContentLibrary = (libraryId) => (
  useQuery({
    queryKey: ['contentLibrary', libraryId],
    queryFn: () => getContentLibrary(libraryId),
  })
);

/**
 * Hook to fetch a content library by its ID.
 * @param {string} [libraryId] - The ID of the library to fetch.
 */
export const useLibraryBlockTypes = (libraryId) => (
  useQuery({
    queryKey: ['contentLibrary', 'libraryBlockTypes', libraryId],
    queryFn: () => getLibraryBlockTypes(libraryId),
  })
);
