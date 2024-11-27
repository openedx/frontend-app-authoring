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
export const getContentTaxonomyTagsCountApiUrl = (contentId) => new URL(`api/content_tagging/v1/object_tag_counts/${contentId}/?count_implicit`, getApiBaseUrl()).href;

/**
 * Get all tags that belong to taxonomy.
 * @param {number} taxonomyId The id of the taxonomy to fetch tags for
 * @param {{page?: number, searchTerm?: string, parentTag?: string}} options
 * @returns {Promise<import("../../taxonomy/data/types.js").TagListData>}
 */
export async function getTaxonomyTagsData(taxonomyId, options = {}) {
  const url = getTaxonomyTagsApiUrl(taxonomyId, options);
  const { data } = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(data);
}

/**
 * Get the tags that are applied to the content object
 * @param {string} contentId The id of the content object to fetch the applied tags for
 * @returns {Promise<import("./types.js").ContentTaxonomyTagsData>}
 */
export async function getContentTaxonomyTagsData(contentId) {
  const { data } = await getAuthenticatedHttpClient().get(getContentTaxonomyTagsApiUrl(contentId));
  return camelCaseObject(data[contentId]);
}

/**
 * Get the count of tags that are applied to the content object
 * @param {string} contentId The id of the content object to fetch the count of the applied tags for
 * @returns {Promise<number>}
 */
export async function getContentTaxonomyTagsCount(contentId) {
  const { data } = await getAuthenticatedHttpClient().get(getContentTaxonomyTagsCountApiUrl(contentId));
  if (contentId in data) {
    return camelCaseObject(data[contentId]);
  }
  return 0;
}

/**
 * Fetch meta data (eg: display_name) about the content object (unit/compoenent)
 * @param {string} contentId The id of the content object (unit/component)
 * @returns {Promise<import("./types.js").ContentData | null>}
 */
export async function getContentData(contentId) {
  let url;
  if (contentId.startsWith('lib-collection:')) {
    // This type of usage_key is not used to obtain collections
    // is only used in tagging.
    return null;
  }

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
 * @param {Promise<import("./types.js").UpdateTagsData[]>} tagsData The list of tags (values) to set on content object
 * @returns {Promise<import("./types.js").ContentTaxonomyTagsData>}
 */
export async function updateContentTaxonomyTags(contentId, tagsData) {
  const url = getContentTaxonomyTagsApiUrl(contentId);
  const { data } = await getAuthenticatedHttpClient().put(url, { tagsData });
  return camelCaseObject(data[contentId]);
}
