// @ts-check
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient, getAuthenticatedUser } from '@edx/frontend-platform/auth';

import { convertObjectToSnakeCase } from '../../utils';

export const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
export const getCreateOrRerunCourseUrl = () => new URL('course/', getApiBaseUrl()).href;
export const getCourseRerunUrl = (courseId) => new URL(`/api/contentstore/v1/course_rerun/${courseId}`, getApiBaseUrl()).href;
export const getOrganizationsUrl = () => new URL('organizations', getApiBaseUrl()).href;
export const getUserPermissionsUrl = (courseId, userId) => `${getApiBaseUrl()}/api/course_roles/v1/user_permissions/?course_id=${encodeURIComponent(courseId)}&user_id=${userId}`;
export const getUserPermissionsEnabledFlagUrl = new URL('/api/course_roles/v1/user_permissions/enabled/', getApiBaseUrl()).href;
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
 * Get user course roles permissions.
 * @param {string} courseId
 * @param {string} userId
 * @returns {Promise<Object>}
 */
export async function getUserPermissions(courseId) {
  const { userId } = getAuthenticatedUser();

  const { data } = await getAuthenticatedHttpClient()
    .get(getUserPermissionsUrl(courseId, userId));
  return camelCaseObject(data);
}

export async function getUserPermissionsEnabledFlag() {
  const { data } = await getAuthenticatedHttpClient()
    .get(getUserPermissionsEnabledFlagUrl);
  return data || false;
}
