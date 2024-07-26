import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  type GetLibrariesV2CustomParams,
  getContentLibrary,
  getLibraryBlockTypes,
  createLibraryBlock,
  getContentLibraryV2List,
  commitLibraryChanges,
  revertLibraryChanges,
  updateLibraryMetadata,
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
export const useLibraryBlockTypes = (libraryId: string) => (
  useQuery({
    queryKey: libraryAuthoringQueryKeys.contentLibraryBlockTypes(libraryId),
    queryFn: () => getLibraryBlockTypes(libraryId),
  })
);

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

export const useUpdateLibraryMetadata = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateLibraryMetadata,
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: libraryAuthoringQueryKeys.contentLibrary(variables.id) });
    },
  });
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

export const useCommitLibraryChanges = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: commitLibraryChanges,
    onSettled: (_data, _error, libraryId) => {
      queryClient.invalidateQueries({ queryKey: libraryAuthoringQueryKeys.contentLibrary(libraryId) });
    },
  });
};

export const useRevertLibraryChanges = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: revertLibraryChanges,
    onSettled: (_data, _error, libraryId) => {
      queryClient.invalidateQueries({ queryKey: libraryAuthoringQueryKeys.contentLibrary(libraryId) });
    },
  });
};
