/* eslint-disable import/prefer-default-export */
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { convertObjectToSnakeCase } from '../../utils';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
const getCourseDetailsApiUrl = () => `${getApiBaseUrl()}/api/contentstore/v1/course_details/`;
const getCourseSettingsApiUrl = () => `${getApiBaseUrl()}/api/contentstore/v1/course_settings/`;

/**
 * Get course details.
 * @param {string} courseId
 * @returns {Promise<Object>}
 */
export async function getCourseDetails(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getCourseDetailsApiUrl()}${courseId}`);
  return camelCaseObject(data);
}

/**
 * Update course details.
 * @param {string} courseId
 * @param {object} details
 * @returns {Promise<Object>}
 */
export async function updateCourseDetails(courseId, details) {
  const { data } = await getAuthenticatedHttpClient()
    .put(`${getCourseDetailsApiUrl()}${courseId}`, convertObjectToSnakeCase(details, true));
  return camelCaseObject(data);
}

/**
 * Get course settings.
 * @param {string} courseId
 * @returns {Promise<Object>}
 */
export async function getCourseSettings(courseId) {
  const { data } = await getAuthenticatedHttpClient().get(`${getCourseSettingsApiUrl()}${courseId}`);
  return camelCaseObject(data);
}
