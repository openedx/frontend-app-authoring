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

/**
 * Get's studio home courses.
 *
 * FC-0118 (ADR 0028/0037): migrated to the standardized v4 `home/courses`
 * endpoint. The trailing slash is required by the DRF DefaultRouter that serves
 * the v4 ViewSet. The deprecated non-paginated v1 `home/courses` fallback has
 * been dropped; pagination, filtering, and ordering are handled natively by v4.
 */
export async function getStudioHomeCoursesV2(search: string, customParams: object): Promise<object> {
  const customParamsFormat = snakeCaseObject(customParams);
  const { data } = await getAuthenticatedHttpClient().get(
    `${getApiBaseUrl()}/api/contentstore/v4/home/courses/${search}`,
    { params: customParamsFormat },
  );
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
