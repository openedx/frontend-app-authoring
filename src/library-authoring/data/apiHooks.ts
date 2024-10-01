import { camelCaseObject } from '@edx/frontend-platform';
import {
  useQuery,
  useMutation,
  useQueryClient,
  type Query,
  type QueryClient,
} from '@tanstack/react-query';

import { getLibraryId } from '../../generic/key-utils';
import {
  type GetLibrariesV2CustomParams,
  type ContentLibrary,
  type XBlockFields,
  type UpdateXBlockFieldsRequest,
  getContentLibrary,
  getLibraryBlockTypes,
  createLibraryBlock,
  getContentLibraryV2List,
  commitLibraryChanges,
  revertLibraryChanges,
  updateLibraryMetadata,
  libraryPasteClipboard,
  getLibraryBlockMetadata,
  getXBlockFields,
  updateXBlockFields,
  createCollection,
  getXBlockOLX,
  updateCollectionMetadata,
  type UpdateCollectionComponentsRequest,
  updateCollectionComponents,
  type CreateLibraryCollectionDataRequest,
  getCollectionMetadata,
} from './api';

export const libraryQueryPredicate = (query: Query, libraryId: string): boolean => {
  // Invalidate all content queries related to this library.
  // If we allow searching "all courses and libraries" in the future,
  // then we'd have to invalidate all `["content_search", "results"]`
  // queries, and not just the ones for this library, because items from
  // this library could be included in an "all courses and libraries"
  // search. For now we only allow searching individual libraries.
  const extraFilter = query.queryKey[5]; // extraFilter contains library id
  if (!(Array.isArray(extraFilter) || typeof extraFilter === 'string')) {
    return false;
  }

  return query.queryKey[0] === 'content_search' && extraFilter?.includes(`context_key = "${libraryId}"`);
};

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
  collection: (libraryId?: string, collectionId?: string) => [
    ...libraryAuthoringQueryKeys.all,
    libraryId,
    collectionId,
  ],
};

export const xblockQueryKeys = {
  all: ['xblock'],
  /**
   * Base key for data specific to a xblock
   */
  xblock: (usageKey?: string) => [...xblockQueryKeys.all, usageKey],
  /** Fields (i.e. the content, display name, etc.) of an XBlock */
  xblockFields: (usageKey: string) => [...xblockQueryKeys.xblock(usageKey), 'fields'],
  /** OLX (XML representation of the fields/content) */
  xblockOLX: (usageKey: string) => [...xblockQueryKeys.xblock(usageKey), 'OLX'],
  componentMetadata: (usageKey: string) => [...xblockQueryKeys.xblock(usageKey), 'componentMetadata'],
};

/**
 * Tell react-query to refresh its cache of any data related to the given
 * component (XBlock).
 *
 * Note that technically it's possible to derive the library key from the
 * usageKey, so we could refactor this to only require the usageKey.
 *
 * @param queryClient The query client - get it via useQueryClient()
 * @param contentLibraryId The ID of library that holds the XBlock ("lib:...")
 * @param usageKey The usage ID of the XBlock ("lb:...")
 */
export function invalidateComponentData(queryClient: QueryClient, contentLibraryId: string, usageKey: string) {
  queryClient.invalidateQueries({ queryKey: xblockQueryKeys.xblockFields(usageKey) });
  queryClient.invalidateQueries({ queryKey: xblockQueryKeys.componentMetadata(usageKey) });
  queryClient.invalidateQueries({ predicate: (query) => libraryQueryPredicate(query, contentLibraryId) });
}

/**
 * Hook to fetch a content library by its ID.
 */
export const useContentLibrary = (libraryId: string | undefined) => (
  useQuery({
    queryKey: libraryAuthoringQueryKeys.contentLibrary(libraryId),
    queryFn: () => getContentLibrary(libraryId!),
    enabled: libraryId !== undefined,
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
      queryClient.invalidateQueries({ predicate: (query) => libraryQueryPredicate(query, variables.libraryId) });
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
      queryClient.invalidateQueries({ predicate: (query) => libraryQueryPredicate(query, libraryId) });
    },
  });
};

export const useLibraryPasteClipboard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: libraryPasteClipboard,
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: libraryAuthoringQueryKeys.contentLibrary(variables.libraryId) });
      queryClient.invalidateQueries({ predicate: (query) => libraryQueryPredicate(query, variables.libraryId) });
    },
  });
};

export const useLibraryBlockMetadata = (usageId: string) => (
  useQuery({
    queryKey: xblockQueryKeys.componentMetadata(usageId),
    queryFn: () => getLibraryBlockMetadata(usageId),
  })
);

export const useXBlockFields = (usageKey: string) => (
  useQuery({
    queryKey: xblockQueryKeys.xblockFields(usageKey),
    queryFn: () => getXBlockFields(usageKey),
    enabled: !!usageKey,
  })
);

export const useUpdateXBlockFields = (usageKey: string) => {
  const contentLibraryId = getLibraryId(usageKey);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateXBlockFieldsRequest) => updateXBlockFields(usageKey, data),
    onMutate: async (data) => {
      const queryKey = xblockQueryKeys.xblockFields(usageKey);
      const previousBlockData = queryClient.getQueriesData(queryKey)[0][1] as XBlockFields;
      const formatedData = camelCaseObject(data);

      const newBlockData = {
        ...previousBlockData,
        ...(formatedData.metadata?.displayName && { displayName: formatedData.metadata.displayName }),
        metadata: {
          ...previousBlockData.metadata,
          ...formatedData.metadata,
        },
      };

      queryClient.setQueryData(queryKey, newBlockData);

      return { previousBlockData, newBlockData };
    },
    onError: (_err, _data, context) => {
      queryClient.setQueryData(
        xblockQueryKeys.xblockFields(usageKey),
        context?.previousBlockData,
      );
    },
    onSettled: () => {
      invalidateComponentData(queryClient, contentLibraryId, usageKey);
    },
  });
};

/**
 * Use this mutation to create a library collection
 */
export const useCreateLibraryCollection = (libraryId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLibraryCollectionDataRequest) => createCollection(libraryId, data),
    onSettled: () => {
      queryClient.invalidateQueries({ predicate: (query) => libraryQueryPredicate(query, libraryId) });
    },
  });
};

/* istanbul ignore next */ // This is only used in developer builds, and the associated UI doesn't work in test or prod
export const useXBlockOLX = (usageKey: string) => (
  useQuery({
    queryKey: xblockQueryKeys.xblockOLX(usageKey),
    queryFn: () => getXBlockOLX(usageKey),
    enabled: !!usageKey,
  })
);

/**
 * Get the metadata for a collection in a library
 */
export const useCollection = (libraryId: string, collectionId: string) => (
  useQuery({
    enabled: !!libraryId && !!collectionId,
    queryKey: libraryAuthoringQueryKeys.collection(libraryId, collectionId),
    queryFn: () => getCollectionMetadata(libraryId!, collectionId!),
  })
);

/**
 * Use this mutation to update the fields of a collection in a library
 */
export const useUpdateCollection = (libraryId: string, collectionId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateCollectionComponentsRequest) => updateCollectionMetadata(libraryId, collectionId, data),
    onSettled: () => {
      // NOTE: We invalidate the library query here because we need to update the library's
      // collection list.
      queryClient.invalidateQueries({ predicate: (query) => libraryQueryPredicate(query, libraryId) });
      queryClient.invalidateQueries({ queryKey: libraryAuthoringQueryKeys.collection(libraryId, collectionId) });
    },
  });
};

/**
 * Use this mutation to add components to a collection in a library
 */
export const useUpdateCollectionComponents = (libraryId?: string, collectionId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (usage_keys: string[]) => {
      if (libraryId !== undefined && collectionId !== undefined) {
        return updateCollectionComponents(libraryId, collectionId, usage_keys);
      }
      return undefined;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSettled: (_data, _error, _variables) => {
      if (libraryId !== undefined && collectionId !== undefined) {
        queryClient.invalidateQueries({ predicate: (query) => libraryQueryPredicate(query, libraryId) });
      }
    },
  });
};
