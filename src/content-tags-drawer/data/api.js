// @ts-check
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
export const getTaxonomyTagsApiUrl = (taxonomyId) => new URL(`api/content_tagging/v1/taxonomies/${taxonomyId}/tags/`, getApiBaseUrl()).href;
export const getContentTaxonomyTagsApiUrl = (contentId) => new URL(`api/content_tagging/v1/object_tags/${contentId}/`, getApiBaseUrl()).href;
export const getContentDataApiUrl = (contentId) => new URL(`/xblock/outline/${contentId}`, getApiBaseUrl()).href;

/**
 * Get all tags that belong to taxonomy.
 * @param {number} taxonomyId The id of the taxonomy to fetch tags for
 * @param {string} fullPathProvided Optional param that contains the full URL to fetch data
 *                 If provided, we use it instead of generating the URL. This is usually for fetching subTags
 * @returns {Promise<import("./types.mjs").TaxonomyTagsData>}
 */
export async function getTaxonomyTagsData(taxonomyId, fullPathProvided) {
  const { data } = await getAuthenticatedHttpClient().get(
    fullPathProvided ? new URL(`${fullPathProvided}`) : getTaxonomyTagsApiUrl(taxonomyId),
  );
  return camelCaseObject(data);
}

/**
 * Get the tags that are applied to the content object
 * @param {string} contentId The id of the content object to fetch the applied tags for
 * @returns {Promise<import("./types.mjs").ContentTaxonomyTagsData>}
 */
export async function getContentTaxonomyTagsData(contentId) {
  const { data } = await getAuthenticatedHttpClient().get(getContentTaxonomyTagsApiUrl(contentId));
  return camelCaseObject(data[contentId]);
}

/**
 * Fetch meta data (eg: display_name) about the content object (unit/compoenent)
 * @param {string} contentId The id of the content object (unit/component)
 * @returns {Promise<import("./types.mjs").ContentData>}
 */
export async function getContentData(contentId) {
  const { data } = await getAuthenticatedHttpClient().get(getContentDataApiUrl(contentId));
  return camelCaseObject(data);
}

/**
 * Update content object's applied tags
 * @param {string} contentId The id of the content object (unit/component)
 * @param {number} taxonomyId The id of the taxonomy the tags belong to
 * @param {string[]} tags The list of tags (values) to set on content object
 * @returns {Promise<Object>}
 */
export async function updateContentTaxonomyTags(contentId, taxonomyId, tags) {
  let url = getContentTaxonomyTagsApiUrl(contentId);
  url = `${url}?taxonomy=${taxonomyId}`;
  const { data } = await getAuthenticatedHttpClient().put(url, { tags });
  return camelCaseObject(data[contentId]);
}
