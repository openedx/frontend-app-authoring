// @ts-check
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
export const getTaxonomyListApiUrl = () => new URL('api/content_tagging/v1/taxonomies/?enabled=true', getApiBaseUrl()).href;
export const getExportTaxonomyApiUrl = (pk, format) => new URL(
  `api/content_tagging/v1/taxonomies/${pk}/export/?output_format=${format}&download=1`,
  getApiBaseUrl(),
).href;

/**
 * Get list of taxonomies.
 * @returns {Promise<Object>}
 */
export async function getTaxonomyListData() {
  const { data } = await getAuthenticatedHttpClient().get(getTaxonomyListApiUrl());
  return camelCaseObject(data);
}

/**
 * Downloads the file of the exported taxonomy
 * @param {number} pk
 * @param {string} format
 * @returns {void}
 */
export function getTaxonomyExportFile(pk, format) {
  window.location.href = getExportTaxonomyApiUrl(pk, format);
}
