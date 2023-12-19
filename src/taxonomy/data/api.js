// @ts-check
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;

export const getTaxonomyListApiUrl = (org) => {
  const url = new URL('api/content_tagging/v1/taxonomies/', getApiBaseUrl());
  url.searchParams.append('enabled', 'true');
  url.searchParams.append('page_size', '500'); // For the tagging MVP, we don't paginate the taxonomy list
  if (org !== undefined) {
    url.searchParams.append('org', org);
  }
  return url.href;
};

export const getExportTaxonomyApiUrl = (pk, format) => new URL(
  `api/content_tagging/v1/taxonomies/${pk}/export/?output_format=${format}&download=1`,
  getApiBaseUrl(),
).href;

export const getTaxonomyTemplateApiUrl = (format) => new URL(
  `api/content_tagging/v1/taxonomies/import/template.${format}`,
  getApiBaseUrl(),
).href;

/**
  * Get the URL for a Taxonomy
  * @param {number} pk
  * @returns {string}
  */
export const getTaxonomyApiUrl = (pk) => new URL(`api/content_tagging/v1/taxonomies/${pk}/`, getApiBaseUrl()).href;

/**
 * Get list of taxonomies.
 * @param {string} org Optioanl organization query param
 * @returns {Promise<import("./types.mjs").TaxonomyListData>}
 */
export async function getTaxonomyListData(org) {
  const { data } = await getAuthenticatedHttpClient().get(getTaxonomyListApiUrl(org));
  return camelCaseObject(data);
}

/**
 * Delete a Taxonomy
 * @param {number} pk
 * @returns {Promise<Object>}
 */
export async function deleteTaxonomy(pk) {
  await getAuthenticatedHttpClient().delete(getTaxonomyApiUrl(pk));
}

/** Get a Taxonomy
  * @param {number} pk
  * @returns {Promise<import("./types.mjs").TaxonomyData>}
  */
export async function getTaxonomy(pk) {
  const { data } = await getAuthenticatedHttpClient().get(getTaxonomyApiUrl(pk));
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
