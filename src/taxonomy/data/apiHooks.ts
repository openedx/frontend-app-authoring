/**
 * This is a file used especially in this `taxonomy` module.
 *
 * We are using a new approach, using `useQuery` to build and execute the queries to the APIs.
 * This approach accelerates the development.
 *
 * In this file you will find two types of hooks:
 * - Hooks that builds the query with `useQuery`. These hooks are not used outside of this file.
 *   Ex. useTaxonomyListData.
 * - Hooks that calls the query hook, prepare and return the data.
 *   Ex. useTaxonomyListDataResponse & useIsTaxonomyListDataLoaded.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { camelCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { apiUrls, ALL_TAXONOMIES } from './api';
import * as api from './api';
import type { QueryOptions, TagListData } from './types';

/*
**Create Query Parameters**
        * id (required) - The ID of the taxonomy to create a Tag for

    **Create Request Body**
        * tag (required): The value of the Tag that should be added to
          the Taxonomy
        * parent_tag_value (optional): The value of the parent tag that the new
          Tag should fall under
        * extenal_id (optional): The external id for the new Tag

    **Create Example Requests**
        POST api/tagging/v1/taxonomy/:id/tags                                       - Create a Tag in taxonomy
        {
            "value": "New Tag",
            "parent_tag_value": "Parent Tag"
            "external_id": "abc123",
        }

    **Create Query Returns**
        * 201 - Success
        * 400 - Invalid parameters provided
        * 403 - Permission denied
        * 404 - Taxonomy not found
*/

// Query key patterns. Allows an easy way to clear all data related to a given taxonomy.
// https://github.com/openedx/frontend-app-admin-portal/blob/2ba315d/docs/decisions/0006-tanstack-react-query.rst
// Inspired by https://tkdodo.eu/blog/effective-react-query-keys#use-query-key-factories.
export const taxonomyQueryKeys = {
  all: ['taxonomies'],
  /**
   * Key for the list of taxonomies, optionally filtered by org.
   * @param org Which org we fetched the taxonomy list for (optional)
   */
  taxonomyList: (org?: string) => [
    ...taxonomyQueryKeys.all, 'taxonomyList', ...(org && org !== ALL_TAXONOMIES ? [org] : []),
  ],
  /**
   * Base key for data specific to a single taxonomy. No data is stored directly in this key.
   * @param taxonomyId ID of the taxonomy
   */
  taxonomy: (taxonomyId: number) => [...taxonomyQueryKeys.all, 'taxonomy', taxonomyId],
  /**
   * @param taxonomyId ID of the taxonomy
   */
  taxonomyMetadata: (taxonomyId: number) => [...taxonomyQueryKeys.taxonomy(taxonomyId), 'metadata'],
  /**
   * @param taxonomyId ID of the taxonomy
   */
  taxonomyTagList: (taxonomyId: number) => [...taxonomyQueryKeys.taxonomy(taxonomyId), 'tags'],
  /**
   * @param taxonomyId ID of the taxonomy
   * @param pageIndex Which page of tags to load (zero-based)
   * @param pageSize
   */
  taxonomyTagListPage: (taxonomyId: number, pageIndex: number, pageSize: number) => [
    ...taxonomyQueryKeys.taxonomyTagList(taxonomyId), 'page', pageIndex, pageSize,
  ],
  /**
   * Query for loading _all_ the subtags of a particular parent tag
   * @param taxonomyId ID of the taxonomy
   * @param parentTagValue
   */
  taxonomyTagSubtagsList: (taxonomyId: number, parentTagValue: string) => [
    ...taxonomyQueryKeys.taxonomyTagList(taxonomyId), 'subtags', parentTagValue,
  ],
  /**
   * @param taxonomyId ID of the taxonomy
   * @param fileId Some string to uniquely identify the file we want to upload
   */
  importPlan: (taxonomyId: number, fileId: string) => [...taxonomyQueryKeys.all, 'importPlan', taxonomyId, fileId],
} satisfies Record<string, (string | number)[] | ((...args: any[]) => (string | number)[])>;

/**
 * Builds the query to get the taxonomy list
 * @param {string} [org] Filter the list to only show taxonomies assigned to this org
 */
export const useTaxonomyList = (org) => (
  useQuery({
    queryKey: taxonomyQueryKeys.taxonomyList(org),
    queryFn: () => api.getTaxonomyListData(org),
  })
);

/**
 * Builds the mutation to delete a taxonomy.
 * @returns A function that can be used to delete the taxonomy.
 */
export const useDeleteTaxonomy = () => {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: async ({ pk }: { pk: number }) => api.deleteTaxonomy(pk),
    onSettled: (_d, _e, args) => {
      queryClient.invalidateQueries({ queryKey: taxonomyQueryKeys.taxonomyList() });
      queryClient.removeQueries({ queryKey: taxonomyQueryKeys.taxonomy(args.pk) });
    },
  });
  return mutateAsync;
};

/** Builds the query to get the taxonomy detail */
export const useTaxonomyDetails = (taxonomyId: number) => useQuery({
  queryKey: taxonomyQueryKeys.taxonomyMetadata(taxonomyId),
  queryFn: () => api.getTaxonomy(taxonomyId),
});

/**
 * Use this mutation to import a new taxonomy.
 */
export const useImportNewTaxonomy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name, description, file,
    }: { name: string, description: string, file: File }) => {
      const formData = new FormData();
      formData.append('taxonomy_name', name);
      formData.append('taxonomy_description', description);
      formData.append('file', file);

      const { data } = await getAuthenticatedHttpClient().post(apiUrls.createTaxonomyFromImport(), formData);
      return camelCaseObject(data);
    },
    onSuccess: (data) => {
      // There's a new taxonomy, so the list of taxonomies needs to be refreshed:
      queryClient.invalidateQueries({
        queryKey: taxonomyQueryKeys.taxonomyList(),
      });
      queryClient.setQueryData(taxonomyQueryKeys.taxonomyMetadata(data.id), data);
    },
  });
};

/**
 * Build the mutation to import tags to an existing taxonomy
 */
export const useImportTags = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taxonomyId, file }: { taxonomyId: number, file: File }) => {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const { data } = await getAuthenticatedHttpClient().put(apiUrls.tagsImport(taxonomyId), formData);
        return camelCaseObject(data);
      } catch (err) {
        throw new Error((err as any).response?.data?.error || (err as any).message);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: taxonomyQueryKeys.taxonomyTagList(data.id),
      });
      // In the metadata, 'tagsCount' (and possibly other fields) will have changed:
      queryClient.setQueryData(taxonomyQueryKeys.taxonomyMetadata(data.id), data);
    },
  });
};

/**
 * Preview the results of importing the given file into an existing taxonomy.
 * @param taxonomyId The ID of the taxonomy whose tags we're updating.
 * @param file The file that we want to import
 */
export const useImportPlan = (taxonomyId: number, file: File | null) => useQuery({
  queryKey: taxonomyQueryKeys.importPlan(taxonomyId, file ? `${file.name}${file.lastModified}${file.size}` : ''),
  queryFn: async (): Promise<string | null> => {
    if (!taxonomyId || file === null) {
      return null;
    }
    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await getAuthenticatedHttpClient().put(apiUrls.tagsPlanImport(taxonomyId), formData);
      return data.plan as string;
    } catch (err) {
      throw new Error((err as any).response?.data?.error || (err as any).message);
    }
  },
  retry: false, // If there's an error, it's probably a real problem with the file. Don't try again several times!
});

/**
 * Use the list of tags in a taxonomy.
 */
export const useTagListData = (taxonomyId: number, options: QueryOptions) => {
  const { pageIndex, pageSize } = options;
  return useQuery({
    queryKey: taxonomyQueryKeys.taxonomyTagListPage(taxonomyId, pageIndex, pageSize),
    queryFn: async () => {
      const { data } = await getAuthenticatedHttpClient().get(apiUrls.tagList(taxonomyId, pageIndex, pageSize, 1000));
      return camelCaseObject(data) as TagListData;
    },
  });
};

/**
 * Temporary hook to load *all* the subtags of a given tag in a taxonomy.
 * Doesn't handle pagination or anything. This is meant to be replaced by
 * something more sophisticated later, as we improve the "taxonomy details" page.
 */
export const useSubTags = (taxonomyId: number, parentTagValue: string) => useQuery({
  queryKey: taxonomyQueryKeys.taxonomyTagSubtagsList(taxonomyId, parentTagValue),
  queryFn: async () => {
    const response = await getAuthenticatedHttpClient().get(apiUrls.allSubtagsOf(taxonomyId, parentTagValue));
    return camelCaseObject(response.data) as TagListData;
  },
});

export const useCreateTag = (taxonomyId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ value, parentTagValue }: { value: string, parentTagValue?: string }) => {
      try {
        await getAuthenticatedHttpClient().post(apiUrls.createTag(taxonomyId), { tag: value });
      } catch (err) {
        throw new Error((err as any).response?.data?.error || (err as any).message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: taxonomyQueryKeys.taxonomyTagList(taxonomyId),
      });
      // In the metadata, 'tagsCount' (and possibly other fields) will have changed:
      queryClient.invalidateQueries({ queryKey: taxonomyQueryKeys.taxonomyMetadata(taxonomyId) });
    },
  });
}
