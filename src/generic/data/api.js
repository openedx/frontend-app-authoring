// @ts-check
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { convertObjectToSnakeCase } from '../../utils';

export const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
export const getCreateOrRerunCourseUrl = () => new URL('course/', getApiBaseUrl()).href;
export const getCourseRerunUrl = (courseId) => new URL(`/api/contentstore/v1/course_rerun/${courseId}`, getApiBaseUrl()).href;
export const getOrganizationsUrl = () => new URL('organizations', getApiBaseUrl()).href;
export const getClipboardUrl = () => `${getApiBaseUrl()}/api/content-staging/v1/clipboard/`;
export const getTagsCountApiUrl = (contentPattern) => new URL(`api/content_tagging/v1/object_tag_counts/${contentPattern}/?count_implicit`, getApiBaseUrl()).href;

/**
 * Get's organizations data. Returns list of organization names.
 * @returns {Promise<string[]>}
 */
export async function getOrganizations() {
  const { data } = await getAuthenticatedHttpClient().get(
    getOrganizationsUrl(),
  );
  return camelCaseObject(data);
}

/**
 * Get's course rerun data.
 * @returns {Promise<Object>}
 */
export async function getCourseRerun(courseId) {
  const { data } = await getAuthenticatedHttpClient().get(
    getCourseRerunUrl(courseId),
  );
  return camelCaseObject(data);
}

/**
 * Create or rerun course with data.
 * @param {object} courseData
 * @returns {Promise<Object>}
 */
export async function createOrRerunCourse(courseData) {
  const { data } = await getAuthenticatedHttpClient().post(
    getCreateOrRerunCourseUrl(),
    convertObjectToSnakeCase(courseData, true),
  );
  return camelCaseObject(data);
}

/**
 * Retrieves user's clipboard.
 * @returns {Promise<Object>} - A Promise that resolves clipboard data.
 */
export async function getClipboard() {
  const { data } = await getAuthenticatedHttpClient()
    .get(getClipboardUrl());

  return camelCaseObject(data);
}

/**
 * Updates user's clipboard.
 * @param {string} usageKey - The ID of the block.
 * @returns {Promise<Object>} - A Promise that resolves clipboard data.
 */
export async function updateClipboard(usageKey) {
  const { data } = await getAuthenticatedHttpClient()
    .post(getClipboardUrl(), { usage_key: usageKey });

  return camelCaseObject(data);
}

/**
 * Gets the tags count of multiple content by id separated by commas or a pattern using a '*' wildcard.
 * @param {string} contentPattern
 * @returns {Promise<Object>}
*/
export async function getTagsCount(contentPattern) {
  if (contentPattern) {
    const { data } = await getAuthenticatedHttpClient()
      .get(getTagsCountApiUrl(contentPattern));

    return data;
  }
  return null;
}
