// @ts-check
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

// Query key patterns. Allows an easy way to clear all data related to a given taxonomy.
// https://github.com/openedx/frontend-app-admin-portal/blob/2ba315d/docs/decisions/0006-tanstack-react-query.rst
// Inspired by https://tkdodo.eu/blog/effective-react-query-keys#use-query-key-factories.
export const taxonomyQueryKeys = {
  all: ['taxonomies'],
  /**
   * Key for the list of taxonomies, optionally filtered by org.
   * @param {string} [org] Which org we fetched the taxonomy list for (optional)
   */
  taxonomyList: (org) => [
    ...taxonomyQueryKeys.all, 'taxonomyList', ...(org && org !== ALL_TAXONOMIES ? [org] : []),
  ],
  /**
   * Base key for data specific to a single taxonomy. No data is stored directly in this key.
   * @param {number} taxonomyId ID of the taxonomy
   */
  taxonomy: (taxonomyId) => [...taxonomyQueryKeys.all, 'taxonomy', taxonomyId],
  /**
   * @param {number} taxonomyId ID of the taxonomy
   */
  taxonomyMetadata: (taxonomyId) => [...taxonomyQueryKeys.taxonomy(taxonomyId), 'metadata'],
  /**
   * @param {number} taxonomyId ID of the taxonomy
   */
  taxonomyTagList: (taxonomyId) => [...taxonomyQueryKeys.taxonomy(taxonomyId), 'tags'],
  /**
   * @param {number} taxonomyId ID of the taxonomy
   * @param {number} pageIndex Which page of tags to load (zero-based)
   * @param {number} pageSize
   */
  taxonomyTagListPage: (taxonomyId, pageIndex, pageSize) => [
    ...taxonomyQueryKeys.taxonomyTagList(taxonomyId), 'page', pageIndex, pageSize,
  ],
  /**
   * Query for loading _all_ the subtags of a particular parent tag
   * @param {number} taxonomyId ID of the taxonomy
   * @param {string} parentTagValue
   */
  taxonomyTagSubtagsList: (taxonomyId, parentTagValue) => [
    ...taxonomyQueryKeys.taxonomyTagList(taxonomyId), 'subtags', parentTagValue,
  ],
  /**
   * @param {number} taxonomyId ID of the taxonomy
   * @param {string} fileId Some string to uniquely identify the file we want to upload
   */
  importPlan: (taxonomyId, fileId) => [...taxonomyQueryKeys.all, 'importPlan', taxonomyId, fileId],
};

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
    /** @type {import("@tanstack/react-query").MutateFunction<any, any, {pk: number}>} */
    mutationFn: async ({ pk }) => api.deleteTaxonomy(pk),
    onSettled: (_d, _e, args) => {
      queryClient.invalidateQueries({ queryKey: taxonomyQueryKeys.taxonomyList() });
      queryClient.removeQueries({ queryKey: taxonomyQueryKeys.taxonomy(args.pk) });
    },
  });
  return mutateAsync;
};

/** Builds the query to get the taxonomy detail
  * @param {number} taxonomyId
  */
export const useTaxonomyDetails = (taxonomyId) => useQuery({
  queryKey: taxonomyQueryKeys.taxonomyMetadata(taxonomyId),
  queryFn: () => api.getTaxonomy(taxonomyId),
});

/**
 * Use this mutation to import a new taxonomy.
 */
export const useImportNewTaxonomy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    /**
    * @type {import("@tanstack/react-query").MutateFunction<
    *   import("./types.mjs").TaxonomyData,
    *   any,
    *   {
    *     name: string,
    *     exportId: string,
    *     description: string,
    *     file: File,
    *   }
    * >}
    */
    mutationFn: async ({
      name, exportId, description, file,
    }) => {
      const formData = new FormData();
      formData.append('taxonomy_name', name);
      formData.append('taxonomy_export_id', exportId);
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
    /**
    * @type {import("@tanstack/react-query").MutateFunction<
    *   import("./types.mjs").TaxonomyData,
    *   any,
    *   {
    *     taxonomyId: number,
    *     file: File,
    *   }
    * >}
    */
    mutationFn: async ({ taxonomyId, file }) => {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const { data } = await getAuthenticatedHttpClient().put(apiUrls.tagsImport(taxonomyId), formData);
        return camelCaseObject(data);
      } catch (/** @type {any} */ err) {
        throw new Error(err.response?.data?.error || err.message);
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
 * @param {number} taxonomyId The ID of the taxonomy whose tags we're updating.
 * @param {File|null} file The file that we want to import
 */
export const useImportPlan = (taxonomyId, file) => useQuery({
  queryKey: taxonomyQueryKeys.importPlan(taxonomyId, file ? `${file.name}${file.lastModified}${file.size}` : ''),
  /**
  * @type {import("@tanstack/react-query").QueryFunction<string|null>}
  */
  queryFn: async () => {
    if (file === null) {
      return null;
    }
    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await getAuthenticatedHttpClient().put(apiUrls.tagsPlanImport(taxonomyId), formData);
      return /** @type {string} */(data.plan);
    } catch (/** @type {any} */ err) {
      throw new Error(err.response?.data?.error || err.message);
    }
  },
  retry: false, // If there's an error, it's probably a real problem with the file. Don't try again several times!
});
