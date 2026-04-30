import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AvailableGroup } from '../types';

const API_PATH_PATTERN = 'group_configurations';
const getStudioBaseUrl = () => getConfig().STUDIO_BASE_URL;

export interface GroupConfigurationResponse {
  allGroupConfigurations: AvailableGroup[];
  experimentGroupConfigurations?: AvailableGroup[];
  mfeProctoredExamSettingsUrl: string;
  shouldShowEnrollmentTrack: boolean;
  shouldShowExperimentGroups: boolean;
}

export const getContentStoreApiUrl = (courseId: string) =>
  `${getStudioBaseUrl()}/api/contentstore/v1/${API_PATH_PATTERN}/${courseId}`;
export const getLegacyApiUrl = (courseId: string, parentGroupId?: number, groupId?: number) => {
  const parentUrlPath = `${getStudioBaseUrl()}/${API_PATH_PATTERN}/${courseId}`;
  const parentGroupPath = `${parentGroupId ? `/${parentGroupId}` : ''}`;
  const groupPath = `${groupId ? `/${groupId}` : ''}`;
  return `${parentUrlPath}${parentGroupPath}${groupPath}`;
};

/**
 * Get content groups and experimental group configurations for course.
 */
export async function getGroupConfigurations(courseId: string): Promise<GroupConfigurationResponse> {
  const { data } = await getAuthenticatedHttpClient().get(
    getContentStoreApiUrl(courseId),
  );

  return camelCaseObject(data);
}

/**
 * Create new content group for course.
 */
export async function createContentGroup(courseId: string, group: AvailableGroup): Promise<AvailableGroup> {
  const { data } = await getAuthenticatedHttpClient().post(
    getLegacyApiUrl(courseId, group.id),
    group,
  );

  return camelCaseObject(data);
}

/**
 * Edit exists content group in course.
 */
export async function editContentGroup(courseId: string, group: AvailableGroup): Promise<AvailableGroup> {
  const { data } = await getAuthenticatedHttpClient().post(
    getLegacyApiUrl(courseId, group.id),
    group,
  );

  return camelCaseObject(data);
}

/**
 * Delete exists content group from the course.
 */
export async function deleteContentGroup(courseId: string, parentGroupId: number, groupId: number): Promise<void> {
  await getAuthenticatedHttpClient().delete(
    getLegacyApiUrl(courseId, parentGroupId, groupId),
  );
}

/**
 * Create a new experiment configuration for the course.
 */
export async function createExperimentConfiguration(
  courseId: string,
  configuration: AvailableGroup,
): Promise<AvailableGroup> {
  const { data } = await getAuthenticatedHttpClient().post(
    getLegacyApiUrl(courseId),
    configuration,
  );

  return camelCaseObject(data);
}

/**
 * Edit the experiment configuration for the course.
 */
export async function editExperimentConfiguration(
  courseId: string,
  configuration: AvailableGroup,
): Promise<AvailableGroup> {
  const { data } = await getAuthenticatedHttpClient().post(
    getLegacyApiUrl(courseId, configuration.id),
    configuration,
  );

  return camelCaseObject(data);
}

/**
 * Delete existing experimental configuration from the course.
 */
export async function deleteExperimentConfiguration(courseId: string, configurationId: number): Promise<void> {
  await getAuthenticatedHttpClient().delete(
    getLegacyApiUrl(courseId, configurationId),
  );
}
