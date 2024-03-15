// @ts-check
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;

/**
 * Get the URL used to fetch tags data from the "taxonomy tags" REST API
 * @param {number} taxonomyId
 * @param {{page?: number, searchTerm?: string, parentTag?: string}} options
 * @returns {string} the URL
 */
export const getTaxonomyTagsApiUrl = (taxonomyId, options = {}) => {
  const url = new URL(`api/content_tagging/v1/taxonomies/${taxonomyId}/tags/`, getApiBaseUrl());
  if (options.parentTag) {
    url.searchParams.append('parent_tag', options.parentTag);
  }
  if (options.page) {
    url.searchParams.append('page', String(options.page));
  }
  if (options.searchTerm) {
    url.searchParams.append('search_term', options.searchTerm);
  }

  // Load in the full tree if children at once, if we can:
  // Note: do not combine this with page_size (we currently aren't using page_size)
  url.searchParams.append('full_depth_threshold', '1000');

  return url.href;
};
export const getContentTaxonomyTagsApiUrl = (contentId) => new URL(`api/content_tagging/v1/object_tags/${contentId}/`, getApiBaseUrl()).href;
export const getXBlockContentDataApiURL = (contentId) => new URL(`/xblock/outline/${contentId}`, getApiBaseUrl()).href;
export const getCourseContentDataApiURL = (contentId) => new URL(`/api/contentstore/v1/course_settings/${contentId}`, getApiBaseUrl()).href;
export const getLibraryContentDataApiUrl = (contentId) => new URL(`/api/libraries/v2/blocks/${contentId}/`, getApiBaseUrl()).href;

/**
 * Get all tags that belong to taxonomy.
 * @param {number} taxonomyId The id of the taxonomy to fetch tags for
 * @param {{page?: number, searchTerm?: string, parentTag?: string}} options
 * @returns {Promise<import("../../taxonomy/tag-list/data/types.mjs").TagListData>}
 */
export async function getTaxonomyTagsData(taxonomyId, options = {}) {
  const url = getTaxonomyTagsApiUrl(taxonomyId, options);
  const { data } = await getAuthenticatedHttpClient().get(url);
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
  let url;
  if (contentId.startsWith('lb:')) {
    url = getLibraryContentDataApiUrl(contentId);
  } else if (contentId.startsWith('course-v1:')) {
    url = getCourseContentDataApiURL(contentId);
  } else {
    url = getXBlockContentDataApiURL(contentId);
  }
  const { data } = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(data);
}

/**
 * Update content object's applied tags
 * @param {string} contentId The id of the content object (unit/component)
 * @param {number} taxonomyId The id of the taxonomy the tags belong to
 * @param {string[]} tags The list of tags (values) to set on content object
 * @returns {Promise<import("./types.mjs").ContentTaxonomyTagsData>}
 */
export async function updateContentTaxonomyTags(contentId, taxonomyId, tags) {
  const url = getContentTaxonomyTagsApiUrl(contentId);
  const params = { taxonomy: taxonomyId };
  const { data } = await getAuthenticatedHttpClient().put(url, { tags }, { params });
  return camelCaseObject(data[contentId]);
}
