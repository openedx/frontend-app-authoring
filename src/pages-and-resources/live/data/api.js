/* eslint-disable import/prefer-default-export */
import { camelCaseObject, ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

ensureConfig([
  'STUDIO_BASE_URL',
], 'Course Apps API service');

const apiBaseUrl = getConfig().STUDIO_BASE_URL;

export const providersApiUrl = `${apiBaseUrl}/api/course_live/providers`;
export const providerConfigurationApiUrl = `${apiBaseUrl}/api/course_live/course`;

/**
 * Fetches providers for provided course
 * @param {string} courseId
 * @returns {Promise<[{}]>}
 */
export async function getLiveProviders(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${providersApiUrl}/${courseId}/`);
  return camelCaseObject(data);
}

/**
 * Fetches provider settings for provided course
 * @param {string} courseId
 * @returns {Promise<[{}]>}
 */
export async function getLiveConfiguration(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${providerConfigurationApiUrl}/${courseId}/`);
  return camelCaseObject(data);
}

export async function postLiveConfiguration(courseId, config) {
  const data = await getAuthenticatedHttpClient().post(
    `${providerConfigurationApiUrl}/${courseId}/`,
    config,
  );
  return camelCaseObject(data);
}
