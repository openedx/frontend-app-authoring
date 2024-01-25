import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const API_PATH_PATTERN = 'group_configurations';
const getStudioBaseUrl = () => getConfig().STUDIO_BASE_URL;

export const getGroupConfigurationsApiUrl = (courseId) => `${getStudioBaseUrl()}/api/contentstore/v1/${API_PATH_PATTERN}/${courseId}`;

/**
 * Get content groups and experimental group configurations for course.
 * @param {string} courseId
 * @returns {Promise<Object>}
 */
export async function getGroupConfigurations(courseId) {
  const { data } = await getAuthenticatedHttpClient().get(
    getGroupConfigurationsApiUrl(courseId),
  );

  return camelCaseObject(data);
}
