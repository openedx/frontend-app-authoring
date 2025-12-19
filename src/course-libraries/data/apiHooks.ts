import {
  type QueryClient,
  useQuery,
  skipToken,
  useMutation,
  UseQueryResult,
} from '@tanstack/react-query';
import { UserTaskStatus } from '../../data/constants';
import { UserTaskStatusWithUuid } from '../../data/types';
import { getEntityLinksSummaryByDownstreamContext, getEntityLinks, getCourseReadyToMigrateLegacyLibContentBlocks, migrateCourseReadyToMigrateLegacyLibContentBlocks, getCourseLegacyLibRefUpdateTaskStatus } from './api';

export const courseLibrariesQueryKeys = {
  all: ['courseLibraries'],
  courseLibraries: (courseId?: string) => [...courseLibrariesQueryKeys.all, courseId],
  courseReadyToSyncLibraries: ({
    contentType, courseId, readyToSync, upstreamKey,
  }: {
    contentType?: 'all' | 'components' | 'containers',
    courseId?: string,
    readyToSync?: boolean,
    upstreamKey?: string,
    pageSize?: number,
  }) => {
    const key: Array<string | boolean | number> = [...courseLibrariesQueryKeys.all];
    if (courseId !== undefined) {
      key.push(courseId);
    }
    if (contentType !== undefined) {
      key.push(contentType);
    }
    if (readyToSync !== undefined) {
      key.push(readyToSync);
    }
    if (upstreamKey !== undefined) {
      key.push(upstreamKey);
    }
    return key;
  },
  courseLibrariesSummary: (courseId?: string) => [...courseLibrariesQueryKeys.courseLibraries(courseId), 'summary'],
  legacyLibReadyToMigrateBlocks: (courseId: string) => [...courseLibrariesQueryKeys.courseLibraries(courseId), 'legacyLibReadyToMigrateBlocks'],
  legacyLibReadyToMigrateBlocksStatus: (courseId: string, taskId?: string) => [
    ...courseLibrariesQueryKeys.legacyLibReadyToMigrateBlocks(courseId),
    'status',
    { taskId },
  ],
};

export const useEntityLinks = ({
  courseId, readyToSync, useTopLevelParents, upstreamKey, contentType,
}: {
  courseId?: string,
  readyToSync?: boolean,
  useTopLevelParents?: boolean,
  upstreamKey?: string,
  contentType?: 'all' | 'components' | 'containers',
}) => (
  useQuery({
    queryKey: courseLibrariesQueryKeys.courseReadyToSyncLibraries({
      contentType: contentType ?? 'all',
      courseId,
      readyToSync,
      upstreamKey,
    }),
    queryFn: () => getEntityLinks(
      courseId,
      readyToSync,
      useTopLevelParents,
      upstreamKey,
      contentType,
    ),
    enabled: courseId !== undefined || upstreamKey !== undefined || readyToSync !== undefined,
  })
);

/**
 * Hook to fetch publishable entity links summary by course key.
 */
export const useEntityLinksSummaryByDownstreamContext = (courseId?: string) => (
  useQuery({
    queryKey: courseLibrariesQueryKeys.courseLibrariesSummary(courseId),
    queryFn: () => getEntityLinksSummaryByDownstreamContext(courseId!),
    enabled: courseId !== undefined,
  })
);

/**
 * Ivalidates the downstream links query for a course
 */
export const invalidateLinksQuery = (queryClient: QueryClient, courseId: string) => {
  queryClient.invalidateQueries({
    queryKey: courseLibrariesQueryKeys.courseLibraries(courseId),
  });
};

export const useCourseLegacyLibReadyToMigrateBlocks = (courseId: string, enabled: boolean = true) => (
  useQuery({
    queryKey: courseLibrariesQueryKeys.legacyLibReadyToMigrateBlocks(courseId),
    queryFn: enabled && courseId ? () => getCourseReadyToMigrateLegacyLibContentBlocks(courseId) : skipToken,
  })
);

export const useMigrateCourseLegacyLibReadyToMigrateBlocks = (courseId: string) => useMutation({
  mutationFn: () => migrateCourseReadyToMigrateLegacyLibContentBlocks(courseId),
  gcTime: 60, // Cache for 1 minute to prevent rapid re-run of updating references
});

export const useCheckMigrateCourseLegacyLibReadyToMigrateBlocksOptions = (
  courseId: string,
  taskId?: string,
): UseQueryResult<UserTaskStatusWithUuid> => useQuery({
  queryKey: courseLibrariesQueryKeys.legacyLibReadyToMigrateBlocksStatus(courseId, taskId),
  queryFn: taskId ? () => getCourseLegacyLibRefUpdateTaskStatus(courseId, taskId) : skipToken,
  refetchInterval: (query) => ([
    UserTaskStatus.Succeeded,
    UserTaskStatus.Failed,
    UserTaskStatus.Cancelled,
  ].includes(query.state.data?.state || UserTaskStatus.InProgress) ? false : 2000),
});
