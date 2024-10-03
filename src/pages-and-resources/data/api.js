import { snakeCase } from 'lodash/string';

import { camelCaseObject, ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

ensureConfig([
  'STUDIO_BASE_URL',
], 'Course Apps API service');

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
export const getCourseAppsApiUrl = () => `${getApiBaseUrl()}/api/course_apps/v1/apps`;
export const getCourseAdvancedSettingsApiUrl = () => `${getApiBaseUrl()}/api/contentstore/v0/advanced_settings`;

/**
 * Fetches the course apps installed for provided course
 * @param {string} courseId
 * @returns {Promise<[{}]>}
 */
export async function getCourseApps(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getCourseAppsApiUrl()}/${courseId}`);
  return camelCaseObject(data);
}

/**
 * Updates the status of a course app.
 * @param {string} courseId Course ID for the course to operate on
 * @param {string} appId ID for the application to operate on
 * @param {boolean} state The new state
 */
export async function updateCourseApp(courseId, appId, state) {
  await getAuthenticatedHttpClient()
    .patch(
      `${getCourseAppsApiUrl()}/${courseId}`,
      {
        id: appId,
        enabled: state,
      },
    );
}

/**
 * Get's advanced setting for a course.
 * @param {string} courseId
 * @param {[string]} settings
 * @returns {Promise<Object>}
 */
export async function getCourseAdvancedSettings(courseId, settings) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getCourseAdvancedSettingsApiUrl()}/${courseId}`, { filter_fields: settings.map(snakeCase).join(',') });
  return camelCaseObject(data);
}

/**
 * Get's advanced setting for a course.
 * @param {string} courseId
 * @param {string} setting
 * @param {*} value
 * @returns {Promise<Object>}
 */
export async function updateCourseAdvancedSettings(courseId, setting, value) {
  const { data } = await getAuthenticatedHttpClient()
    .patch(`${getCourseAdvancedSettingsApiUrl()}/${courseId}`, { [snakeCase(setting)]: { value } });
  return camelCaseObject(data);
}
