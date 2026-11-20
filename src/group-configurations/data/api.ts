import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { omit } from 'lodash';
import { getAllPages } from '@src/generic/data/paginatedList';
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

interface GroupConfiguration extends AvailableGroup {
  canManage: boolean;
}

interface CourseSettings {
  contentExperimentsEnabled: boolean;
  mfeProctoredExamSettingsUrl: string;
}

export const getGroupConfigurationsApiUrl = (courseId: string) =>
  `${getStudioBaseUrl()}/api/authoring/v2/courses/${courseId}/${API_PATH_PATTERN}/`;
export const getCourseSettingsApiUrl = (courseId: string) =>
  `${getStudioBaseUrl()}/api/authoring/v2/courses/${courseId}/settings/`;
export const getLegacyApiUrl = (courseId: string, parentGroupId?: number, groupId?: number) => {
  const parentUrlPath = `${getStudioBaseUrl()}/${API_PATH_PATTERN}/${courseId}`;
  const parentGroupPath = `${parentGroupId ? `/${parentGroupId}` : ''}`;
  const groupPath = `${groupId ? `/${groupId}` : ''}`;
  return `${parentUrlPath}${parentGroupPath}${groupPath}`;
};

/**
 * Get content groups and experimental group configurations for course.
 *
 * The server lists every configuration the page shows in one list; content
 * experiments are the configurations with the 'random' scheme. Whether the
 * course has content experiments turned on, and the proctored exam settings
 * link, come from the course settings.
 */
export async function getGroupConfigurations(courseId: string): Promise<GroupConfigurationResponse> {
  const [configurations, { data: settingsData }] = await Promise.all([
    // The page shows where each configuration and group is used, which only the full view returns.
    getAllPages<object>(getGroupConfigurationsApiUrl(courseId), { view: 'full' }),
    getAuthenticatedHttpClient().get(getCourseSettingsApiUrl(courseId)),
  ]);
  const groupConfigurations: AvailableGroup[] = (camelCaseObject(configurations) as GroupConfiguration[])
    // The page asks the permissions API whether the user may manage them.
    .map((configuration) => omit(configuration, ['canManage']));
  const settings: CourseSettings = camelCaseObject(settingsData);

  return {
    allGroupConfigurations: groupConfigurations.filter(({ scheme }) => scheme !== 'random'),
    experimentGroupConfigurations: groupConfigurations.filter(({ scheme }) => scheme === 'random'),
    mfeProctoredExamSettingsUrl: settings.mfeProctoredExamSettingsUrl,
    // The server lists the enrollment track configuration only when the page should show it.
    shouldShowEnrollmentTrack: groupConfigurations.some(({ scheme }) => scheme === 'enrollment_track'),
    shouldShowExperimentGroups: settings.contentExperimentsEnabled,
  };
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
