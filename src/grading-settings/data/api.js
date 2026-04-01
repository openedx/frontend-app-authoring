import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { deepConvertingKeysToCamelCase, deepConvertingKeysToSnakeCase } from '../../utils';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
export const getGradingSettingsApiUrl = (courseId) =>
  `${getApiBaseUrl()}/api/contentstore/v1/course_grading/${courseId}`;

/**
 * Get's grading setting for a course.
 * @param {string} courseId
 * @returns {Promise<Object>}
 */
export async function getGradingSettings(courseId) {
  const { data } = await getAuthenticatedHttpClient().get(getGradingSettingsApiUrl(courseId));
  return deepConvertingKeysToCamelCase(data);
}

/**
 * Send`s grading setting for a course.
 * @param {string} courseId
 * @param {object} settings
 * @returns {Promise<Object>}
 */
export async function sendGradingSettings(courseId, settings) {
  const { data } = await getAuthenticatedHttpClient().post(
    getGradingSettingsApiUrl(courseId),
    deepConvertingKeysToSnakeCase(settings),
  );
  return camelCaseObject(data);
}
