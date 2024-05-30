import { camelCaseObject, snakeCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
export const getStudioHomeApiUrl = () => new URL('api/contentstore/v1/home', getApiBaseUrl()).href;
export const getRequestCourseCreatorUrl = () => new URL('request_course_creator', getApiBaseUrl()).href;
export const getCourseNotificationUrl = (url) => new URL(url, getApiBaseUrl()).href;

/**
 * Get's studio home data.
 * @param {string} search
 * @returns {Promise<Object>}
 */
export async function getStudioHomeData() {
  const { data } = await getAuthenticatedHttpClient().get(getStudioHomeApiUrl());
  return camelCaseObject(data);
}

export async function getStudioHomeCourses(search) {
  const { data } = await getAuthenticatedHttpClient().get(`${getApiBaseUrl()}/api/contentstore/v1/home/courses${search}`);
  return camelCaseObject(data);
}
/**
 * Get's studio home courses.
 * @param {string} search - Query string parameters for filtering the courses.
 * @param {object} customParams - Additional custom parameters for the API request.
 * @returns {Promise<Object>} - A Promise that resolves to the response data containing the studio home courses.
 * Note: We are changing /api/contentstore/v1 to /api/contentstore/v2 due to upcoming breaking changes.
 * Features such as pagination, filtering, and ordering are better handled in the new version.
 * Please refer to this PR for further details: https://github.com/openedx/edx-platform/pull/34173
 */
export async function getStudioHomeCoursesV2(search, customParams) {
  const customParamsFormat = snakeCaseObject(customParams);
  const { data } = await getAuthenticatedHttpClient().get(`${getApiBaseUrl()}/api/contentstore/v2/home/courses${search}`, { params: customParamsFormat });
  return camelCaseObject(data);
}

export async function getStudioHomeLibraries() {
  const { data } = await getAuthenticatedHttpClient().get(`${getApiBaseUrl()}/api/contentstore/v1/home/libraries`);
  return camelCaseObject(data);
}

/**
 * Get's studio home v2 Libraries.
 * @param {object} customParams - Additional custom paramaters for the API request.
 * @param {string} [customParams.type] - (optional) Library type, default `complex`
 * @param {number} [customParams.page] - (optional) Page number of results
 * @param {number} [customParams.pageSize] - (optional) The number of results on each page, default `50`
 * @param {boolean} [customParams.pagination] - (optional) Whether pagination is supported, default `true`
 * @returns {Promise<Object>} - A Promise that resolves to the response data container the studio home v2 libraries.
 */
export async function getStudioHomeLibrariesV2(customParams) {
  // Set default params if not passed in
  const customParamsDefaults = {
    type: customParams.type || 'complex',
    page: customParams.page || 1,
    pageSize: customParams.pageSize || 50,
    pagination: customParams.pagination !== undefined ? customParams.pagination : true,
  };
  const customParamsFormat = snakeCaseObject(customParamsDefaults);
  const { data } = await getAuthenticatedHttpClient().get(`${getApiBaseUrl()}/api/libraries/v2/`, { params: customParamsFormat });
  return camelCaseObject(data);
}

/**
 * Handle course notification requests.
 * @param {string} url
 * @returns {Promise<Object>}
*/
export async function handleCourseNotification(url) {
  const { data } = await getAuthenticatedHttpClient().delete(getCourseNotificationUrl(url));
  return camelCaseObject(data);
}

/**
 * Send user request to course creation access for studio home data.
 * @returns {Promise<Object>}
 */
export async function sendRequestForCourseCreator() {
  const { data } = await getAuthenticatedHttpClient().post(getRequestCourseCreatorUrl());
  return camelCaseObject(data);
}
