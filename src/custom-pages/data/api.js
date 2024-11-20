import { camelCaseObject, ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

ensureConfig([
  'STUDIO_BASE_URL',
], 'Course Apps API service');

export const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
export const getTabHandlerUrl = (courseId) => `${getApiBaseUrl()}/api/contentstore/v0/tabs/${courseId}`;

/**
 * Fetches the course custom pages for provided course
 * @param {string} courseId
 * @returns {Promise<[{}]>}
 */
export async function getCustomPages(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getTabHandlerUrl(courseId)}`);
  return camelCaseObject(data);
}

/**
 * Delete custom page for provided block.
 * @param {blockId} courseId Course ID for the course to operate on

 */
export async function deleteCustomPage(blockId) {
  await getAuthenticatedHttpClient()
    .delete(`${getApiBaseUrl()}/xblock/${blockId}`);
}

/**
 * Add custom page for provided block.
 * @param {blockId} courseId Course ID for the course to operate on

 */
export async function addCustomPage(courseId) {
  const v1CourseId = courseId.substring(7);
  const courseBlockId = `block-${v1CourseId}+type@course+block@course`;
  const { data } = await getAuthenticatedHttpClient()
    .put(`${getApiBaseUrl()}/xblock/`, {
      category: 'static_tab',
      parent_locator: courseBlockId,
    });
  return camelCaseObject(data);
}

/**
 * Update custom page html for provided block.
 * @param {blockId} courseId Course ID for the course to operate on

 */
export async function updateCustomPage({ blockId, htmlString, metadata }) {
  const { data } = await getAuthenticatedHttpClient()
    .put(`${getApiBaseUrl()}/xblock/${blockId}`, {
      id: blockId,
      data: htmlString,
      metadata,
    });
  return camelCaseObject(data);
}

/**
 * Update order of custom pages.
 * @param {blockId} courseId Course ID for the course to operate on

 */
export async function updateCustomPageOrder(courseId, tabs) {
  await getAuthenticatedHttpClient()
    .post(`${getTabHandlerUrl(courseId)}/reorder`, tabs);
}
