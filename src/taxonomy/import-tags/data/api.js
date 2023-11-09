// @ts-check
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;

export const getTaxonomyImportApiUrl = () => new URL(
  'api/content_tagging/v1/taxonomies/import/',
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

  const { data } = await getAuthenticatedHttpClient().post(getTaxonomyImportApiUrl(), formData);

  return camelCaseObject(data);
}
