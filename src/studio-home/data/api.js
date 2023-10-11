import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
export const getStudioHomeApiUrl = (search) => new URL(`api/contentstore/v1/home${search}`, getApiBaseUrl()).href;
export const getRequestCourseCreatorUrl = () => new URL('request_course_creator', getApiBaseUrl()).href;
export const getCourseNotificationUrl = (url) => new URL(url, getApiBaseUrl()).href;

/**
 * Get's studio home data.
 * @param {string} search
 * @returns {Promise<Object>}
 */
export async function getStudioHomeData(search) {
  const { data } = await getAuthenticatedHttpClient().get(getStudioHomeApiUrl(search));
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
