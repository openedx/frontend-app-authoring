/* eslint-disable import/prefer-default-export */
import { camelCaseObject, ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

ensureConfig([
  'STUDIO_BASE_URL',
], 'Course Apps API service');

const apiBaseUrl = getConfig().STUDIO_BASE_URL;

const courseAppsApiUrl = `${apiBaseUrl}/api/course_apps/v1/apps`;

/**
 * Fetches the course apps installed for provided course
 * @param {string} courseId
 * @returns {Promise<[{}]>}
 */
export async function getCourseApps(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${courseAppsApiUrl}/${courseId}`);
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
      `${courseAppsApiUrl}/${courseId}`,
      {
        id: appId,
        enabled: state,
      },
    );
}
