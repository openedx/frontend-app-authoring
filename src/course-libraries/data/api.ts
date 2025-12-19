import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { UsageKeyBlock, UserTaskStatusWithUuid } from '@src/data/types';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;

export const getEntityLinksByDownstreamContextUrl = () => `${getApiBaseUrl()}/api/contentstore/v2/downstreams/`;
export const getEntityLinksSummaryByDownstreamContextUrl = (downstreamContextKey: string) => `${getApiBaseUrl()}/api/contentstore/v2/downstreams/${downstreamContextKey}/summary`;
export const courseLegacyLibraryContentBlocks = (courseId: string) => `${getApiBaseUrl()}/api/courses/v1/migrate_legacy_content_blocks/${courseId}/`;
export const courseLegacyLibraryContentTaskStatus = (courseId: string, taskId: string) => `${courseLegacyLibraryContentBlocks(courseId)}${taskId}/`;

export interface PaginatedData<T> {
  next: string | null;
  previous: string | null;
  nextPageNum: number | null;
  previousPageNum: number | null;
  count: number;
  numPages: number;
  currentPage: number;
  results: T,
}

export interface BasePublishableEntityLink {
  id: number;
  upstreamContextKey: string;
  upstreamContextTitle: string;
  upstreamVersion: number;
  downstreamUsageKey: string;
  downstreamContextKey: string;
  versionSynced: number;
  versionDeclined: number | null;
  created: string;
  updated: string;
  readyToSync: boolean;
  downstreamIsModified: boolean;
}

export interface ComponentPublishableEntityLink extends BasePublishableEntityLink {
  upstreamUsageKey: string;
}

export interface ContainerPublishableEntityLink extends BasePublishableEntityLink {
  upstreamContainerKey: string;
}

export interface PublishableEntityLink extends BasePublishableEntityLink {
  upstreamKey: string;
  upstreamType: 'component' | 'container';
}

export interface PublishableEntityLinkSummary {
  upstreamContextKey: string;
  upstreamContextTitle: string;
  readyToSyncCount: number;
  totalCount: number;
  lastPublishedAt: string;
}

export const getEntityLinks = async (
  downstreamContextKey?: string,
  readyToSync?: boolean,
  useTopLevelParents?: boolean,
  upstreamKey?: string,
  contentType?: 'all' | 'components' | 'containers',
): Promise<PublishableEntityLink[]> => {
  const { data } = await getAuthenticatedHttpClient()
    .get(getEntityLinksByDownstreamContextUrl(), {
      params: {
        course_id: downstreamContextKey,
        ready_to_sync: readyToSync,
        upstream_key: upstreamKey,
        use_top_level_parents: useTopLevelParents,
        item_type: contentType,
        no_page: true,
      },
    });
  return camelCaseObject(data);
};

export const getEntityLinksSummaryByDownstreamContext = async (
  downstreamContextKey: string,
): Promise<PublishableEntityLinkSummary[]> => {
  const { data } = await getAuthenticatedHttpClient()
    .get(getEntityLinksSummaryByDownstreamContextUrl(downstreamContextKey));
  return camelCaseObject(data);
};

/**
 * Get all legacy library blocks that ready to migrate to library v2 item bank in given course
 */
export async function getCourseReadyToMigrateLegacyLibContentBlocks(courseId: string): Promise<UsageKeyBlock[]> {
  const { data } = await getAuthenticatedHttpClient()
    .get(courseLegacyLibraryContentBlocks(courseId));

  return camelCaseObject(data);
}

/**
 * Migrate legacy library blocks that ready to migrate to library v2 item bank in given course
 */
export async function migrateCourseReadyToMigrateLegacyLibContentBlocks(
  courseId: string,
): Promise<UserTaskStatusWithUuid> {
  const { data } = await getAuthenticatedHttpClient()
    .post(courseLegacyLibraryContentBlocks(courseId));

  return camelCaseObject(data);
}

/**
 * Get task status of legacy library blocks reference update task.
 */
export async function getCourseLegacyLibRefUpdateTaskStatus(
  courseId: string,
  taskId: string,
): Promise<UserTaskStatusWithUuid> {
  const { data } = await getAuthenticatedHttpClient()
    .get(courseLegacyLibraryContentTaskStatus(courseId, taskId));

  return camelCaseObject(data);
}
