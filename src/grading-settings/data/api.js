/* eslint-disable import/prefer-default-export */
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { convertObjectToSnakeCase } from '../../utils';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
export const getGradingSettingsApiUrl = (courseId) => `${getApiBaseUrl()}/api/contentstore/v1/course_grading/${courseId}`;

/**
 * Get's grading setting for a course.
 * @param {string} courseId
 * @returns {Promise<Object>}
 */
export async function getGradingSettings(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(getGradingSettingsApiUrl(courseId));
  return camelCaseObject(data);
}

/**
 * Send`s grading setting for a course.
 * @param {string} courseId
 * @param {object} settings
 * @returns {Promise<Object>}
 */
export async function sendGradingSettings(courseId, settings) {
  const { data } = await getAuthenticatedHttpClient()
    .post(getGradingSettingsApiUrl(courseId), convertObjectToSnakeCase(settings, true));
  return camelCaseObject(data);
}
