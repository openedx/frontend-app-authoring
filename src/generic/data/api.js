import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { convertObjectToSnakeCase } from '../../utils';

export const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
export const getCreateOrRerunCourseUrl = new URL('course/', getConfig().STUDIO_BASE_URL).href;
export const getCourseRerunUrl = (courseId) => new URL(`/api/contentstore/v1/course_rerun/${courseId}`, getConfig().STUDIO_BASE_URL).href;

/**
 * Get's organizations data.
 * @returns {Promise<Object>}
 */
export async function getOrganizations() {
  const { data } = await getAuthenticatedHttpClient().get(
    `${getApiBaseUrl()}/organizations`,
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
 * @param {object} data
 * @returns {Promise<Object>}
 */
export async function createOrRerunCourse(courseData) {
  const { data } = await getAuthenticatedHttpClient().post(
    getCreateOrRerunCourseUrl,
    convertObjectToSnakeCase(courseData, true),
  );
  return camelCaseObject(data);
}
