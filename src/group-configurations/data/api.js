import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const API_PATH_PATTERN = 'group_configurations';
const getStudioBaseUrl = () => getConfig().STUDIO_BASE_URL;

export const getContentStoreApiUrl = (courseId) => `${getStudioBaseUrl()}/api/contentstore/v1/${API_PATH_PATTERN}/${courseId}`;
export const getLegacyApiUrl = (courseId, parentGroupId, groupId) => {
  const parentUrlPath = `${getStudioBaseUrl()}/${API_PATH_PATTERN}/${courseId}`;
  const parentGroupPath = `${parentGroupId ? `/${parentGroupId}` : ''}`;
  const groupPath = `${groupId ? `/${groupId}` : ''}`;
  return `${parentUrlPath}${parentGroupPath}${groupPath}`;
};

/**
 * Get content groups and experimental group configurations for course.
 * @param {string} courseId
 * @returns {Promise<Object>}
 */
export async function getGroupConfigurations(courseId) {
  const { data } = await getAuthenticatedHttpClient().get(
    getContentStoreApiUrl(courseId),
  );

  return camelCaseObject(data);
}

/**
 * Create new content group for course.
 * @param {string} courseId
 * @param {object} group
 * @returns {Promise<Object>}
 */
export async function createContentGroup(courseId, group) {
  const { data } = await getAuthenticatedHttpClient().post(
    getLegacyApiUrl(courseId, group.id),
    group,
  );

  return camelCaseObject(data);
}

/**
 * Edit exists content group in course.
 * @param {string} courseId
 * @param {object} group
 * @returns {Promise<Object>}
 */
export async function editContentGroup(courseId, group) {
  const { data } = await getAuthenticatedHttpClient().post(
    getLegacyApiUrl(courseId, group.id),
    group,
  );

  return camelCaseObject(data);
}

/**
 * Delete exists content group from the course.
 * @param {string} courseId
 * @param {number} parentGroupId
 * @param {number} groupId
 * @returns {Promise<Object>}
 */
export async function deleteContentGroup(courseId, parentGroupId, groupId) {
  const { data } = await getAuthenticatedHttpClient().delete(
    getLegacyApiUrl(courseId, parentGroupId, groupId),
  );

  return camelCaseObject(data);
}

/**
 * Create a new experiment configuration for the course.
 * @param {string} courseId
 * @param {object} configuration
 * @returns {Promise<Object>}
 */
export async function createExperimentConfiguration(courseId, configuration) {
  const { data } = await getAuthenticatedHttpClient().post(
    getLegacyApiUrl(courseId),
    configuration,
  );

  return camelCaseObject(data);
}

/**
 * Edit the experiment configuration for the course.
 * @param {string} courseId
 * @param {object} configuration
 * @returns {Promise<Object>}
 */
export async function editExperimentConfiguration(courseId, configuration) {
  const { data } = await getAuthenticatedHttpClient().post(
    getLegacyApiUrl(courseId, configuration.id),
    configuration,
  );

  return camelCaseObject(data);
}

/**
 * Delete existing experimental configuration from the course.
 * @param {string} courseId
 * @param {number} configurationId
 * @returns {Promise<Object>}
 */
export async function deleteExperimentConfiguration(courseId, configurationId) {
  const { data } = await getAuthenticatedHttpClient().delete(
    getLegacyApiUrl(courseId, configurationId),
  );

  return camelCaseObject(data);
}
