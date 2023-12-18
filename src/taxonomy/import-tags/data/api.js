// @ts-check
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { useQueryClient, useMutation } from '@tanstack/react-query';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;

export const getTaxonomyImportNewApiUrl = () => new URL(
  'api/content_tagging/v1/taxonomies/import/',
  getApiBaseUrl(),
).href;

/**
 * @param {number} taxonomyId
 * @returns {string}
 */
export const getTagsImportApiUrl = (taxonomyId) => new URL(
  `api/content_tagging/v1/taxonomies/${taxonomyId}/tags/import/`,
  getApiBaseUrl(),
).href;

/**
 * @param {number} taxonomyId
 * @returns {string}
 */
export const getTagsPlanImportApiUrl = (taxonomyId) => new URL(
  `api/content_tagging/v1/taxonomies/${taxonomyId}/tags/import/plan/`,
  getApiBaseUrl(),
).href;

/**
 * Import a new taxonomy
 * @param {string} taxonomyName
 * @param {string} taxonomyDescription
 * @param {File} file
 * @returns {Promise<import('../../taxonomy-detail/data/types.mjs').TaxonomyData>}
 */
export async function importNewTaxonomy(taxonomyName, taxonomyDescription, file) {
  // ToDo: transform this to use react-query like useImportTags
  const formData = new FormData();
  formData.append('taxonomy_name', taxonomyName);
  formData.append('taxonomy_description', taxonomyDescription);
  formData.append('file', file);

  const { data } = await getAuthenticatedHttpClient().post(
    getTaxonomyImportNewApiUrl(),
    formData,
  );

  return camelCaseObject(data);
}

/**
 * Build the mutation to import tags to an existing taxonomy
 */
export const useImportTags = () => {
  const queryClient = useQueryClient();
  return useMutation({
    /**
    * @type {import("@tanstack/react-query").MutateFunction<
    *   any,
    *   any,
    *   {
    *     taxonomyId: number
    *     file: File
    *   }
    * >}
    */
    mutationFn: async ({ taxonomyId, file }) => {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const { data } = await getAuthenticatedHttpClient().put(
          getTagsImportApiUrl(taxonomyId),
          formData,
        );

        return camelCaseObject(data);
      } catch (/** @type {any} */ err) {
        throw new Error(err.response?.data || err.message);
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tagList', variables.taxonomyId],
      });
      queryClient.setQueryData(['taxonomyDetail', variables.taxonomyId], data);
    },
  });
};

/**
 * Plan import tags to an existing taxonomy, overwriting existing tags
 * @param {number} taxonomyId
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function planImportTags(taxonomyId, file) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const { data } = await getAuthenticatedHttpClient().put(
      getTagsPlanImportApiUrl(taxonomyId),
      formData,
    );

    return data.plan;
  } catch (/** @type {any} */ err) {
    throw new Error(err.response?.data?.error || err.message);
  }
}
