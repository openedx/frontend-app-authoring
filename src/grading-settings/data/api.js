import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { deepConvertingKeysToCamelCase, deepConvertingKeysToSnakeCase } from '../../utils';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;

// FC-0118 (ADR 0037): the read stays on the v1 `course_grading` endpoint.
// The standardized v3 `authoring_grading` ViewSet only exposes a write
// (PATCH partial_update) and has no GET, so grading settings are still
// fetched from v1 until a v3 read endpoint exists.
export const getGradingSettingsApiUrl = (courseId) =>
  `${getApiBaseUrl()}/api/contentstore/v1/course_grading/${courseId}`;

// FC-0118 (ADR 0031/0037): the write is migrated to the standardized v3
// `authoring_grading` endpoint, which collapses the old GET+POST pair into a
// single PATCH (partial_update). The trailing slash is required by the DRF
// DefaultRouter that serves the v3 ViewSet.
export const getAuthoringGradingApiUrl = (courseId) =>
  `${getApiBaseUrl()}/api/contentstore/v3/authoring_grading/${courseId}/`;

/**
 * Get's grading setting for a course.
 * @param {string} courseId
 * @returns {Promise<Object>}
 */
export async function getGradingSettings(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(getGradingSettingsApiUrl(courseId));
  return deepConvertingKeysToCamelCase(data);
}

/**
 * Send`s grading setting for a course.
 * @param {string} courseId
 * @param {object} settings
 * @returns {Promise<Object>}
 */
export async function sendGradingSettings(courseId, settings) {
  const { data } = await getAuthenticatedHttpClient()
    .patch(getAuthoringGradingApiUrl(courseId), deepConvertingKeysToSnakeCase(settings));
  return camelCaseObject(data);
}
