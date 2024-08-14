import {
  useQuery, useMutation, useQueryClient, Query,
} from '@tanstack/react-query';

import {
  type GetLibrariesV2CustomParams,
  getContentLibrary,
  getLibraryBlockTypes,
  createLibraryBlock,
  getContentLibraryV2List,
  commitLibraryChanges,
  revertLibraryChanges,
  updateLibraryMetadata,
  ContentLibrary,
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
    onMutate: async (data) => {
      const queryKey = libraryAuthoringQueryKeys.contentLibrary(data.id);
      const previousLibraryData = queryClient.getQueriesData(queryKey)[0][1] as ContentLibrary;

      const newLibraryData = {
        ...previousLibraryData,
        title: data.title,
      };

      queryClient.setQueryData(queryKey, newLibraryData);

      return { previousLibraryData, newLibraryData };
    },
    onError: (_err, data, context) => {
      queryClient.setQueryData(
        libraryAuthoringQueryKeys.contentLibrary(data.id),
        context?.previousLibraryData,
      );
    },
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
      queryClient.invalidateQueries({
        // Invalidate all content queries related to this library.
        // If we allow searching "all courses and libraries" in the future,
        // then we'd have to invalidate all `["content_search", "results"]`
        // queries, and not just the ones for this library, because items from
        // this library could be included in an "all courses and libraries"
        // search. For now we only allow searching individual libraries.
        predicate: /* istanbul ignore next */ (query: Query): boolean => {
          // extraFilter contains library id
          const extraFilter = query.queryKey[5];
          if (!(Array.isArray(extraFilter) || typeof extraFilter === 'string')) {
            return false;
          }
          return query.queryKey[0] === 'content_search' && extraFilter?.includes(`context_key = "${libraryId}"`);
        },
      });
    },
  });
};
