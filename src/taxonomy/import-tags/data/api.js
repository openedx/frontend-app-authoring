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
 * @returns {Promise<Object>}
 */
export async function importNewTaxonomy(taxonomyName, taxonomyDescription, file) {
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
 * @returns {import("@tanstack/react-query").UseMutationResult}
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

      await getAuthenticatedHttpClient().put(
        getTagsImportApiUrl(taxonomyId),
        formData,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tagList', variables.taxonomyId],
      });
    },
  });
};

/**
 * Plan import tags to an existing taxonomy, overwriting existing tags
 * @param {number} taxonomyId
 * @param {File} file
 * @returns {Promise<Object>}
 */
export async function planImportTags(taxonomyId, file) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const { data } = await getAuthenticatedHttpClient().put(
      getTagsPlanImportApiUrl(taxonomyId),
      formData,
    );

    return camelCaseObject(data.plan);
  } catch (err) {
    // @ts-ignore
    if (err.response?.data?.error) {
      // @ts-ignore
      throw new Error(err.response.data.error);
    }
    throw err;
  }
}
