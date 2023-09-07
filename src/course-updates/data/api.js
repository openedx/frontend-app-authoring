import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
export const getCourseUpdatesApiUrl = (courseId) => `${getApiBaseUrl()}/course_info_update/${courseId}/`;
export const updateCourseUpdatesApiUrl = (courseId, updateId) => `${getApiBaseUrl()}/course_info_update/${courseId}/${updateId}`;
export const getCourseHandoutApiUrl = (courseId) => {
  const formattedCourseId = courseId.split('course-v1:')[1];
  return `${getApiBaseUrl()}/xblock/block-v1:${formattedCourseId}+type@course_info+block@handouts`;
};

/**
 * Get course updates.
 * @param {string} courseId
 * @returns {Promise<Object>}
 */
export async function getCourseUpdates(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(getCourseUpdatesApiUrl(courseId));

  return data;
}

/**
 * Create new course update.
 * @param {string} courseId
 * @param {object} courseUpdate
 * @returns {Promise<Object>}
 */
export async function createUpdate(courseId, courseUpdate) {
  const { data } = await getAuthenticatedHttpClient()
    .post(getCourseUpdatesApiUrl(courseId), courseUpdate);

  return data;
}

/**
 * Edit course update.
 * @param {string} courseId
 * @param {object} courseUpdate
 * @returns {Promise<Object>}
 */
export async function editUpdate(courseId, courseUpdate) {
  const { data } = await getAuthenticatedHttpClient()
    .put(updateCourseUpdatesApiUrl(courseId, courseUpdate.id), courseUpdate);

  return data;
}

/**
 * Delete course update.
 * @param {string} courseId
 * @param {number} updateId
1 */
export async function deleteUpdate(courseId, updateId) {
  const { data } = await getAuthenticatedHttpClient()
    .delete(updateCourseUpdatesApiUrl(courseId, updateId));

  return data;
}

/**
 * Get course handouts.
 * @param {string} courseId
 * @returns {Promise<Object>}
 */
export async function getCourseHandouts(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(getCourseHandoutApiUrl(courseId));
  return data;
}

/**
 * Edit course handouts.
 * @param {string} courseId
 * @param {object} courseHandouts
 * @returns {Promise<Object>}
 */
export async function editHandouts(courseId, courseHandouts) {
  const { data } = await getAuthenticatedHttpClient()
    .put(getCourseHandoutApiUrl(courseId), courseHandouts);

  return data;
}
