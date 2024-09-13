import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { convertObjectToSnakeCase } from '../../utils';

export const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
export const getCreateOrRerunCourseUrl = () => new URL('course/', getApiBaseUrl()).href;
export const getCourseRerunUrl = (courseId: string) => new URL(
  `/api/contentstore/v1/course_rerun/${courseId}`,
  getApiBaseUrl(),
).href;
export const getOrganizationsUrl = () => new URL('organizations', getApiBaseUrl()).href;
export const getClipboardUrl = () => `${getApiBaseUrl()}/api/content-staging/v1/clipboard/`;
export const getTagsCountApiUrl = (contentPattern: string) => new URL(
  `api/content_tagging/v1/object_tag_counts/${contentPattern}/?count_implicit`,
  getApiBaseUrl(),
).href;

/**
 * Get's organizations data. Returns list of organization names.
 */
export async function getOrganizations(): Promise<string[]> {
  const { data } = await getAuthenticatedHttpClient().get(
    getOrganizationsUrl(),
  );
  return camelCaseObject(data);
}

/**
 * Get's course rerun data.
 */
export async function getCourseRerun(courseId: string): Promise<unknown> {
  const { data } = await getAuthenticatedHttpClient().get(
    getCourseRerunUrl(courseId),
  );
  return camelCaseObject(data);
}

/**
 * Create or rerun course with data.
 */
export async function createOrRerunCourse(courseData: Object): Promise<unknown> {
  const { data } = await getAuthenticatedHttpClient().post(
    getCreateOrRerunCourseUrl(),
    convertObjectToSnakeCase(courseData, true),
  );
  return camelCaseObject(data);
}

export interface ClipboardStatus {
  content: {
    id: number;
    userId: number;
    created: string; // e.g. '2024-08-28T19:02:08.272192Z'
    purpose: 'clipboard';
    status: 'ready' | 'loading' | 'expired' | 'error';
    blockType: string;
    blockTypeDisplay: string;
    olxUrl: string;
    displayName: string;
  } | null;
  sourceUsageKey: string; // May be an empty string
  sourceContextTitle: string; // May be an empty string
  sourceEditUrl: string; // May be an empty string
}

/**
 * Retrieves user's clipboard.
 */
export async function getClipboard(): Promise<ClipboardStatus> {
  const { data } = await getAuthenticatedHttpClient()
    .get(getClipboardUrl());

  return camelCaseObject(data);
}

/**
 * Updates user's clipboard.
 */
export async function updateClipboard(usageKey: string): Promise<ClipboardStatus> {
  const { data } = await getAuthenticatedHttpClient()
    .post(getClipboardUrl(), { usage_key: usageKey });

  return camelCaseObject(data);
}

/**
 * Gets the tags count of multiple content by id separated by commas or a pattern using a '*' wildcard.
*/
export async function getTagsCount(contentPattern?: string): Promise<Record<string, number>> {
  if (!contentPattern) {
    throw new Error('contentPattern is required');
  }

  const { data } = await getAuthenticatedHttpClient()
    .get(getTagsCountApiUrl(contentPattern));

  return data;
}
