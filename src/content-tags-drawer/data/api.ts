import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import type { TagListData } from '@src/taxonomy/data/types';

import type { ContentData, ContentTaxonomyTagsData, UpdateTagsData } from './types';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;

interface GetTaxonomyTagsApiUrlOptions {
  parentTag?: string;
  page?: number;
  searchTerm?: string;
}

/**
 * Get the URL used to fetch tags data from the "taxonomy tags" REST API
 */
export const getTaxonomyTagsApiUrl = (taxonomyId: number, options: GetTaxonomyTagsApiUrlOptions = {}): string => {
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

export const getContentTaxonomyTagsApiUrl = (contentId: string) => new URL(`api/content_tagging/v1/object_tags/${contentId}/`, getApiBaseUrl()).href;
export const getXBlockContentDataApiURL = (contentId: string) => new URL(`/xblock/outline/${contentId}`, getApiBaseUrl()).href;
export const getCourseContentDataApiURL = (contentId: string) => new URL(`/api/contentstore/v1/course_settings/${contentId}`, getApiBaseUrl()).href;
export const getLibraryContentDataApiUrl = (contentId: string) => new URL(`/api/libraries/v2/blocks/${contentId}/`, getApiBaseUrl()).href;
export const getContentTaxonomyTagsCountApiUrl = (contentId: string) => new URL(`api/content_tagging/v1/object_tag_counts/${contentId}/?count_implicit`, getApiBaseUrl()).href;

/**
 * Get all tags that belong to taxonomy.
 */
export async function getTaxonomyTagsData(
  taxonomyId: number,
  options: GetTaxonomyTagsApiUrlOptions = {},
): Promise<TagListData> {
  const url = getTaxonomyTagsApiUrl(taxonomyId, options);
  const { data } = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(data);
}

/**
 * Get the tags that are applied to the content object
 * @param contentId The id of the content object to fetch the applied tags for
 */
export async function getContentTaxonomyTagsData(contentId: string): Promise<ContentTaxonomyTagsData> {
  const url = getContentTaxonomyTagsApiUrl(contentId);
  const { data } = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(data[contentId]);
}

/**
 * Get the count of tags that are applied to the content object
 * @param contentId The id of the content object to fetch the count of the applied tags for
 */
export async function getContentTaxonomyTagsCount(contentId: string): Promise<number> {
  const url = getContentTaxonomyTagsCountApiUrl(contentId);
  const { data } = await getAuthenticatedHttpClient().get(url);
  if (contentId in data) {
    return camelCaseObject(data[contentId]);
  }
  return 0;
}

/**
 * Fetch meta data (eg: display_name) about the content object (unit/component)
 * @param contentId The id of the content object (unit/component)
 */
export async function getContentData(contentId: string): Promise<ContentData> {
  let url: string;

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
 * @param contentId The id of the content object (unit/component)
 * @param tagsData The list of tags (values) to set on content object
 */
export async function updateContentTaxonomyTags(
  contentId: string,
  tagsData: UpdateTagsData[],
): Promise<ContentTaxonomyTagsData> {
  const url = getContentTaxonomyTagsApiUrl(contentId);
  const { data } = await getAuthenticatedHttpClient().put(url, { tagsData });
  return camelCaseObject(data[contentId]);
}
