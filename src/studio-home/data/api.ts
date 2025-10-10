// @ts-check
import { camelCaseObject, snakeCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
export const getStudioHomeApiUrl = () => new URL('api/contentstore/v1/home', getApiBaseUrl()).href;
export const getRequestCourseCreatorUrl = () => new URL('request_course_creator', getApiBaseUrl()).href;
export const getCourseNotificationUrl = (url) => new URL(url, getApiBaseUrl()).href;

/**
 * Get's studio home data.
 */
export async function getStudioHomeData(): Promise<object> {
  const { data } = await getAuthenticatedHttpClient().get(getStudioHomeApiUrl());
  return camelCaseObject(data);
}

/** Get list of courses from the deprecated non-paginated API */
export async function getStudioHomeCourses(search: string) {
  const { data } = await getAuthenticatedHttpClient().get(`${getApiBaseUrl()}/api/contentstore/v1/home/courses${search}`);
  return camelCaseObject(data);
}
/**
 * Get's studio home courses.
 * Note: We are changing /api/contentstore/v1 to /api/contentstore/v2 due to upcoming breaking changes.
 * Features such as pagination, filtering, and ordering are better handled in the new version.
 * Please refer to this PR for further details: https://github.com/openedx/edx-platform/pull/34173
 */
export async function getStudioHomeCoursesV2(search: string, customParams: object): Promise<object> {
  const customParamsFormat = snakeCaseObject(customParams);
  const { data } = await getAuthenticatedHttpClient().get(`${getApiBaseUrl()}/api/contentstore/v2/home/courses${search}`, { params: customParamsFormat });
  return camelCaseObject(data);
}

export interface LibraryV1Data {
  displayName: string;
  libraryKey: string;
  url: string;
  org: string;
  number: string;
  canEdit: boolean;
  isMigrated: boolean;
  migratedToTitle?: string;
  migratedToKey?: string;
  migratedToCollectionKey?: string | null;
  migratedToCollectionTitle?: string | null;
}

export interface LibrariesV1ListData {
  libraries: LibraryV1Data[];
}

export async function getStudioHomeLibraries(): Promise<LibrariesV1ListData> {
  const { data } = await getAuthenticatedHttpClient().get(`${getStudioHomeApiUrl()}/libraries`);
  return camelCaseObject(data);
}

/**
 * Handle course notification requests.
*/
export async function handleCourseNotification(url: string): Promise<object> {
  const { data } = await getAuthenticatedHttpClient().delete(getCourseNotificationUrl(url));
  return camelCaseObject(data);
}

/**
 * Send user request to course creation access for studio home data.
 */
export async function sendRequestForCourseCreator(): Promise<object> {
  const { data } = await getAuthenticatedHttpClient().post(getRequestCourseCreatorUrl());
  return camelCaseObject(data);
}
