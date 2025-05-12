import { camelCaseObject } from '@edx/frontend-platform';
import {
  useQuery,
  useMutation,
  useQueryClient,
  type Query,
  type QueryClient,
  replaceEqualDeep,
} from '@tanstack/react-query';
import { useCallback } from 'react';

import { getLibraryId } from '../../generic/key-utils';
import * as api from './api';
import { VersionSpec } from '../LibraryBlock';

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
  /** All keys for content within the library should be below this key */
  contentLibraryContent: (contentLibraryId?: string) => [
    ...libraryAuthoringQueryKeys.contentLibrary(contentLibraryId),
    'content',
  ],
  /** Keys for the list of all libraries */
  contentLibraryList: (customParams?: api.GetLibrariesV2CustomParams) => [
    ...libraryAuthoringQueryKeys.all,
    'list',
    ...(customParams ? [customParams] : []),
  ],
  libraryTeam: (libraryId?: string) => [
    ...libraryAuthoringQueryKeys.all,
    'list',
    libraryId,
  ],
  collection: (libraryId?: string, collectionId?: string) => [
    ...libraryAuthoringQueryKeys.contentLibraryContent(libraryId),
    'collection',
    collectionId,
  ],
  blockTypes: (libraryId?: string) => [
    ...libraryAuthoringQueryKeys.all,
    'blockTypes',
    libraryId,
  ],
  container: (containerId?: string) => {
    const baseKey = containerId
      ? libraryAuthoringQueryKeys.contentLibraryContent(getLibraryId(containerId))
      : libraryAuthoringQueryKeys.all;
    return [
      ...baseKey,
      'container',
      containerId,
    ];
  },
  containerChildren: (containerId: string) => [
    ...libraryAuthoringQueryKeys.container(containerId),
    'children',
  ],
};

export const xblockQueryKeys = {
  all: ['xblock'],
  /**
   * Base key for data specific to a xblock
   */
  xblock: (usageKey?: string) => [...xblockQueryKeys.all, usageKey],
  /** Fields (i.e. the content, display name, etc.) of an XBlock */
  xblockFields: (usageKey: string, version: VersionSpec = 'draft') => [...xblockQueryKeys.xblock(usageKey), 'fields', version],
  /** OLX (XML representation of the fields/content) */
  xblockOLX: (usageKey: string) => [...xblockQueryKeys.xblock(usageKey), 'OLX'],
  /** assets (static files) */
  xblockAssets: (usageKey: string) => [...xblockQueryKeys.xblock(usageKey), 'assets'],
  componentMetadata: (usageKey: string) => [...xblockQueryKeys.xblock(usageKey), 'componentMetadata'],
  componentDownstreamLinks: (usageKey: string) => [...xblockQueryKeys.xblock(usageKey), 'downstreamLinks'],

  /**
   * Predicate used to invalidate all metadata only (not OLX, fields, assets, etc.).
   * Affects all libraries; we could do a more complex version that affects only one library, but it would require
   * introspecting the usage keys.
   */
  allComponentMetadata: (query: Query) => query.queryKey[0] === 'xblock' && query.queryKey[2] === 'componentMetadata',
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
  // The description and display name etc. may have changed, so refresh everything in the library too:
  // This might fail in case this helper is called after deleting the block.
  queryClient.invalidateQueries({ queryKey: libraryAuthoringQueryKeys.contentLibrary(contentLibraryId) });
  queryClient.invalidateQueries({ predicate: (query) => libraryQueryPredicate(query, contentLibraryId) });
}

/**
 * Hook to fetch a content library by its ID.
 */
export const useContentLibrary = (libraryId: string | undefined) => (
  useQuery({
    queryKey: libraryAuthoringQueryKeys.contentLibrary(libraryId),
    queryFn: () => api.getContentLibrary(libraryId!),
    enabled: libraryId !== undefined,
  })
);

/**
 * Use this mutation to create a block in a library
 */
export const useCreateLibraryBlock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createLibraryBlock,
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: libraryAuthoringQueryKeys.contentLibrary(variables.libraryId) });
      queryClient.invalidateQueries({ predicate: (query) => libraryQueryPredicate(query, variables.libraryId) });
    },
  });
};

/**
 * Use this mutation to delete a block in a library
 */
export const useDeleteLibraryBlock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteLibraryBlock,
    onSettled: (_data, _error, variables) => {
      const libraryId = getLibraryId(variables.usageKey);
      invalidateComponentData(queryClient, libraryId, variables.usageKey);
    },
  });
};

/**
 * Use this mutation to restore a deleted block in a library
 */
export const useRestoreLibraryBlock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.restoreLibraryBlock,
    onSettled: (_data, _error, variables) => {
      const libraryId = getLibraryId(variables.usageKey);
      invalidateComponentData(queryClient, libraryId, variables.usageKey);
    },
  });
};

export const useUpdateLibraryMetadata = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.updateLibraryMetadata,
    onMutate: async (data) => {
      const queryKey = libraryAuthoringQueryKeys.contentLibrary(data.id);
      const previousLibraryData = queryClient.getQueriesData(queryKey)[0][1] as api.ContentLibrary;

      const newLibraryData = {
        ...previousLibraryData,
        ...camelCaseObject(data),
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
export const useContentLibraryV2List = (customParams: api.GetLibrariesV2CustomParams) => (
  useQuery({
    queryKey: libraryAuthoringQueryKeys.contentLibraryList(customParams),
    queryFn: () => api.getContentLibraryV2List(customParams),
    keepPreviousData: true,
  })
);

/** Publish all changes in the library. */
export const useCommitLibraryChanges = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.commitLibraryChanges,
    onSettled: (_data, _error, libraryId) => {
      // Invalidate all content-related metadata and search results for the whole library.
      queryClient.invalidateQueries({ queryKey: libraryAuthoringQueryKeys.contentLibrary(libraryId) });
      queryClient.invalidateQueries({ predicate: (query) => libraryQueryPredicate(query, libraryId) });
      // For XBlocks, the only thing we need to invalidate is the metadata which includes "has unpublished changes"
      queryClient.invalidateQueries({ predicate: xblockQueryKeys.allComponentMetadata });
    },
  });
};

/** Discard all un-published changes in the library */
export const useRevertLibraryChanges = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.revertLibraryChanges,
    onSettled: (_data, _error, libraryId) => {
      // Invalidate all content-related metadata and search results for the whole library.
      queryClient.invalidateQueries({ queryKey: libraryAuthoringQueryKeys.contentLibrary(libraryId) });
      queryClient.invalidateQueries({ predicate: (query) => libraryQueryPredicate(query, libraryId) });
      // For XBlocks, the only thing we need to invalidate is the metadata which includes "has unpublished changes"
      queryClient.invalidateQueries({ predicate: xblockQueryKeys.allComponentMetadata });
    },
  });
};

/**
 * Hook to fetch a content library's team members
 */
export const useLibraryTeam = (libraryId?: string) => (
  useQuery({
    queryKey: libraryAuthoringQueryKeys.libraryTeam(libraryId),
    queryFn: () => api.getLibraryTeam(libraryId!),
    enabled: libraryId !== undefined,
  })
);

/**
 * Hook to fetch the list of XBlock types that can be added to this library.
 */
export const useBlockTypesMetadata = (libraryId?: string) => (
  useQuery({
    queryKey: libraryAuthoringQueryKeys.blockTypes(libraryId),
    queryFn: () => api.getBlockTypes(libraryId!),
    enabled: libraryId !== undefined,
  })
);

/**
 * Hook to add a new member to a content library's team
 */
export const useAddLibraryTeamMember = (libraryId: string | undefined) => {
  const queryClient = useQueryClient();
  const queryKey = libraryAuthoringQueryKeys.libraryTeam(libraryId);

  return useMutation({
    mutationFn: api.addLibraryTeamMember,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};

/**
 * Hook to delete an existing member from a content library's team
 */
export const useDeleteLibraryTeamMember = (libraryId: string | undefined) => {
  const queryClient = useQueryClient();
  const queryKey = libraryAuthoringQueryKeys.libraryTeam(libraryId);

  return useMutation({
    mutationFn: api.deleteLibraryTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};

/**
 * Hook to update an existing member's access in a content library's team
 */
export const useUpdateLibraryTeamMember = (libraryId: string | undefined) => {
  const queryClient = useQueryClient();
  const queryKey = libraryAuthoringQueryKeys.libraryTeam(libraryId);

  return useMutation({
    mutationFn: api.updateLibraryTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};

export const useLibraryPasteClipboard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.libraryPasteClipboard,
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: libraryAuthoringQueryKeys.contentLibrary(variables.libraryId) });
      queryClient.invalidateQueries({ predicate: (query) => libraryQueryPredicate(query, variables.libraryId) });
    },
  });
};

export const useLibraryBlockMetadata = (usageId: string | undefined) => (
  useQuery({
    queryKey: xblockQueryKeys.componentMetadata(usageId!),
    queryFn: () => api.getLibraryBlockMetadata(usageId!),
    enabled: !!usageId,
  })
);

export const useXBlockFields = (usageKey: string, version: VersionSpec = 'draft') => (
  useQuery({
    queryKey: xblockQueryKeys.xblockFields(usageKey, version),
    queryFn: () => api.getXBlockFields(usageKey, version),
    enabled: !!usageKey,
  })
);

export const useUpdateXBlockFields = (usageKey: string) => {
  const contentLibraryId = getLibraryId(usageKey);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: api.UpdateXBlockFieldsRequest) => api.updateXBlockFields(usageKey, data),
    onMutate: async (data) => {
      const queryKey = xblockQueryKeys.xblockFields(usageKey);
      const previousBlockData = queryClient.getQueriesData(queryKey)?.[0]?.[1] as api.XBlockFields | undefined;
      const formatedData = camelCaseObject(data);

      if (!previousBlockData) {
        return { previousBlockData };
      }

      const newBlockData = {
        ...previousBlockData,
        ...(formatedData.metadata?.displayName && { displayName: formatedData.metadata.displayName }),
        metadata: {
          ...previousBlockData.metadata,
          ...formatedData.metadata,
        },
      };

      queryClient.setQueryData(queryKey, newBlockData);

      return { previousBlockData };
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
    mutationFn: (data: api.CreateLibraryCollectionDataRequest) => api.createCollection(libraryId, data),
    onSettled: () => {
      queryClient.invalidateQueries({ predicate: (query) => libraryQueryPredicate(query, libraryId) });
    },
  });
};

/** Get the OLX source of a library component */
export const useXBlockOLX = (usageKey: string, version: VersionSpec) => (
  useQuery({
    queryKey: xblockQueryKeys.xblockOLX(usageKey),
    queryFn: () => api.getXBlockOLX(usageKey, version),
    enabled: !!usageKey,
  })
);

/**
 * Update the OLX of a library component (advanced feature)
 */
export const useUpdateXBlockOLX = (usageKey: string) => {
  const contentLibraryId = getLibraryId(usageKey);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newOLX: string) => api.setXBlockOLX(usageKey, newOLX),
    onSuccess: (olxFromServer) => {
      queryClient.setQueryData(xblockQueryKeys.xblockOLX(usageKey), olxFromServer);
      invalidateComponentData(queryClient, contentLibraryId, usageKey);
    },
  });
};

/**
 * Publish changes to a library component
 */
export const usePublishComponent = (usageKey: string) => {
  const queryClient = useQueryClient();
  const contentLibraryId = getLibraryId(usageKey);
  return useMutation({
    mutationFn: () => api.publishXBlock(usageKey),
    onSettled: () => {
      invalidateComponentData(queryClient, contentLibraryId, usageKey);
    },
  });
};

/** Get the list of assets (static files) attached to a library component */
export const useXBlockAssets = (usageKey: string) => (
  useQuery({
    queryKey: xblockQueryKeys.xblockAssets(usageKey),
    queryFn: () => api.getXBlockAssets(usageKey),
    enabled: !!usageKey,
  })
);

/** Refresh the list of assets (static files) attached to a library component */
export const useInvalidateXBlockAssets = (usageKey: string) => {
  const client = useQueryClient();
  return useCallback(() => {
    client.invalidateQueries({ queryKey: xblockQueryKeys.xblockAssets(usageKey) });
  }, [usageKey]);
};

/**
 * Use this mutation to delete an asset file from a library
 */
export const useDeleteXBlockAsset = (usageKey: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (path: string) => api.deleteXBlockAsset(usageKey, path),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: xblockQueryKeys.xblockAssets(usageKey) });
    },
  });
};

/**
 * Get the metadata for a collection in a library
 */
export const useCollection = (libraryId: string, collectionId: string) => (
  useQuery({
    enabled: !!libraryId && !!collectionId,
    queryKey: libraryAuthoringQueryKeys.collection(libraryId, collectionId),
    queryFn: () => api.getCollectionMetadata(libraryId!, collectionId!),
  })
);

/**
 * Use this mutation to update the fields of a collection in a library
 */
export const useUpdateCollection = (libraryId: string, collectionId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: api.UpdateCollectionComponentsRequest) => (
      api.updateCollectionMetadata(libraryId, collectionId, data)
    ),
    onSettled: () => {
      // NOTE: We invalidate the library query here because we need to update the library's
      // collection list.
      queryClient.invalidateQueries({ predicate: (query) => libraryQueryPredicate(query, libraryId) });
      queryClient.invalidateQueries({ queryKey: libraryAuthoringQueryKeys.collection(libraryId, collectionId) });
    },
  });
};

/**
 * Use this mutation to add items to a collection in a library
 */
export const useAddItemsToCollection = (libraryId?: string, collectionId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (usageKeys: string[]) => {
      if (libraryId !== undefined && collectionId !== undefined) {
        return api.addItemsToCollection(libraryId, collectionId, usageKeys);
      }
      return undefined;
    },
    onSettled: () => {
      if (libraryId !== undefined && collectionId !== undefined) {
        queryClient.invalidateQueries({ predicate: (query) => libraryQueryPredicate(query, libraryId) });
      }
    },
  });
};

/**
 * Use this mutation to remove items from a collection in a library
 */
export const useRemoveItemsFromCollection = (libraryId?: string, collectionId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (usageKeys: string[]) => {
      if (libraryId !== undefined && collectionId !== undefined) {
        return api.removeItemsFromCollection(libraryId, collectionId, usageKeys);
      }
      return undefined;
    },
    onSettled: () => {
      if (libraryId !== undefined && collectionId !== undefined) {
        queryClient.invalidateQueries({ predicate: (query) => libraryQueryPredicate(query, libraryId) });
      }
    },
  });
};

/**
 * Use this mutation to soft delete collections in a library
 */
export const useDeleteCollection = (libraryId: string, collectionId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => api.deleteCollection(libraryId, collectionId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: libraryAuthoringQueryKeys.contentLibrary(libraryId) });
      queryClient.invalidateQueries({ predicate: (query) => libraryQueryPredicate(query, libraryId) });
    },
  });
};

/**
 * Use this mutation to restore soft deleted collections in a library
 */
export const useRestoreCollection = (libraryId: string, collectionId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => api.restoreCollection(libraryId, collectionId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: libraryAuthoringQueryKeys.contentLibrary(libraryId) });
      queryClient.invalidateQueries({ predicate: (query) => libraryQueryPredicate(query, libraryId) });
    },
  });
};

/**
 * Use this mutation to update collections related a component in a library
 */
export const useUpdateComponentCollections = (usageKey: string) => {
  const queryClient = useQueryClient();
  const libraryId = getLibraryId(usageKey);
  return useMutation({
    mutationFn: async (collectionKeys: string[]) => api.updateComponentCollections(usageKey, collectionKeys),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: xblockQueryKeys.componentMetadata(usageKey) });
      queryClient.invalidateQueries({ predicate: (query) => libraryQueryPredicate(query, libraryId) });
    },
  });
};

/**
 * Use this mutation to create a library container
 */
export const useCreateLibraryContainer = (libraryId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: api.CreateLibraryContainerDataRequest) => api.createLibraryContainer(libraryId, data),
    onSettled: () => {
      queryClient.invalidateQueries({ predicate: (query) => libraryQueryPredicate(query, libraryId) });
    },
  });
};

/**
 * Get the metadata for a container in a library
 */
export const useContainer = (containerId?: string) => (
  useQuery({
    enabled: !!containerId,
    queryKey: libraryAuthoringQueryKeys.container(containerId!),
    queryFn: () => api.getContainerMetadata(containerId!),
  })
);

/**
 * Use this mutation to update the fields of a container in a library
 */
export const useUpdateContainer = (containerId: string) => {
  const libraryId = getLibraryId(containerId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: api.UpdateContainerDataRequest) => api.updateContainerMetadata(containerId, data),
    onSettled: () => {
      // NOTE: We invalidate the library query here because we need to update the library's
      // container list.
      queryClient.invalidateQueries({ predicate: (query) => libraryQueryPredicate(query, libraryId) });
      queryClient.invalidateQueries({ queryKey: libraryAuthoringQueryKeys.container(containerId) });
    },
  });
};

/**
 * Use this mutation to soft delete containers in a library
 */
export const useDeleteContainer = (containerId: string) => {
  const libraryId = getLibraryId(containerId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => api.deleteContainer(containerId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: libraryAuthoringQueryKeys.contentLibrary(libraryId) });
      queryClient.invalidateQueries({ predicate: (query) => libraryQueryPredicate(query, libraryId) });
    },
  });
};

/**
 * Use this mutation to restore a container
 */
export const useRestoreContainer = (containerId: string) => {
  const libraryId = getLibraryId(containerId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => api.restoreContainer(containerId),
    onSettled: () => {
      queryClient.invalidateQueries({ predicate: (query) => libraryQueryPredicate(query, libraryId) });
    },
  });
};

/**
 * Get the metadata and children for a container in a library
 */
export const useContainerChildren = (containerId?: string, published: boolean = false) => (
  useQuery({
    enabled: !!containerId,
    queryKey: libraryAuthoringQueryKeys.containerChildren(containerId!),
    queryFn: () => api.getLibraryContainerChildren(containerId!, published),
    structuralSharing: (oldData: api.LibraryBlockMetadata[], newData: api.LibraryBlockMetadata[]) => {
      // This just sets `isNew` flag to new children components
      if (oldData) {
        const oldDataIds = oldData.map((obj) => obj.id);
        // eslint-disable-next-line no-param-reassign
        newData = newData.map((newObj) => {
          if (!oldDataIds.includes(newObj.id)) {
            // Set isNew = true if we have new child on refetch
            // eslint-disable-next-line no-param-reassign
            newObj.isNew = true;
          }
          return newObj;
        });
      }
      return replaceEqualDeep(oldData, newData);
    },
  })
);

/**
 * Use this mutation to add components to a container
 */
export const useAddComponentsToContainer = (containerId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (componentIds: string[]) => {
      // istanbul ignore if: this should never happen
      if (!containerId) {
        return undefined;
      }
      return api.addComponentsToContainer(containerId, componentIds);
    },
    onSettled: () => {
      // istanbul ignore if: this should never happen
      if (!containerId) {
        return;
      }
      // NOTE: We invalidate the library query here because we need to update the library's
      // container list.
      const libraryId = getLibraryId(containerId);
      queryClient.invalidateQueries({ queryKey: libraryAuthoringQueryKeys.containerChildren(containerId) });
      queryClient.invalidateQueries({ predicate: (query) => libraryQueryPredicate(query, libraryId) });
    },
  });
};

/**
 * Use this mutation to update collections related a container in a library
 */
export const useUpdateContainerCollections = (containerId: string) => {
  const queryClient = useQueryClient();
  const libraryId = getLibraryId(containerId);
  return useMutation({
    mutationFn: async (collectionKeys: string[]) => api.updateContainerCollections(containerId, collectionKeys),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: libraryAuthoringQueryKeys.container(containerId) });
      queryClient.invalidateQueries({ predicate: (query) => libraryQueryPredicate(query, libraryId) });
    },
  });
};

/**
 * Update container children
 */
export const useUpdateContainerChildren = (containerId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (usageKeys: string[]) => {
      if (!containerId) {
        return undefined;
      }
      return api.updateLibraryContainerChildren(containerId, usageKeys);
    },
    onSettled: () => {
      if (!containerId) {
        return;
      }
      // NOTE: We invalidate the library query here because we need to update the library's
      // container list.
      const libraryId = getLibraryId(containerId);
      queryClient.invalidateQueries({ predicate: (query) => libraryQueryPredicate(query, libraryId) });
      queryClient.invalidateQueries({ queryKey: libraryAuthoringQueryKeys.container(containerId) });
    },
  });
};

/**
 * Remove components from container
 */
export const useRemoveContainerChildren = (containerId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (usageKeys: string[]) => {
      if (!containerId) {
        return undefined;
      }
      return api.removeLibraryContainerChildren(containerId, usageKeys);
    },
    onSettled: () => {
      if (!containerId) {
        return;
      }
      // NOTE: We invalidate the library query here because we need to update the container
      // count in the library
      const libraryId = getLibraryId(containerId);
      queryClient.invalidateQueries({ predicate: (query) => libraryQueryPredicate(query, libraryId) });
      queryClient.invalidateQueries({ queryKey: libraryAuthoringQueryKeys.container(containerId) });
    },
  });
};

/**
  * Use this mutation to publish changes to a container and any children within it
  */
export const usePublishContainer = (containerId: string) => {
  const queryClient = useQueryClient();
  const libraryId = getLibraryId(containerId);
  return useMutation({
    mutationFn: () => api.publishContainer(containerId),
    onSettled: () => {
      // Invalidate all content-related metadata and search results for the whole library.
      // The child components/xblocks could and even the container itself could appear in many different collections
      // or other containers, so it's best to just invalidate everything.
      queryClient.invalidateQueries({ queryKey: libraryAuthoringQueryKeys.contentLibraryContent(libraryId) });
      queryClient.invalidateQueries({ predicate: (query) => libraryQueryPredicate(query, libraryId) });
      // For XBlocks, the only thing we need to invalidate is the metadata which includes "has unpublished changes"
      queryClient.invalidateQueries({ predicate: xblockQueryKeys.allComponentMetadata });
    },
  });
};
