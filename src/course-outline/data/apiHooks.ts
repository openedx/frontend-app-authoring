import {
  skipToken, useMutation, useQuery, UseQueryResult,
} from '@tanstack/react-query';
import { createCourseXblock } from '@src/course-unit/data/api';
import { UserTaskStatus } from '@src/data/constants';
import {
  getCourseDetails,
  getCourseItem,
  getCourseLegacyLibRefUpdateTaskStatus,
  getCourseReadyToMigrateLegacyLibContentBlocks,
  migrateCourseReadyToMigrateLegacyLibContentBlocks,
} from './api';
import { UserTaskStatusWithUuid } from './types';

export const courseOutlineQueryKeys = {
  all: ['courseOutline'],
  /**
   * Base key for data specific to a course in outline
   */
  contentLibrary: (courseId?: string) => [...courseOutlineQueryKeys.all, courseId],
  courseItemId: (itemId?: string) => [...courseOutlineQueryKeys.all, itemId],
  courseDetails: (courseId?: string) => [...courseOutlineQueryKeys.all, courseId, 'details'],
  legacyLibReadyToMigrateBlocks: (courseId: string) => [...courseOutlineQueryKeys.all, courseId, 'legacyLibReadyToMigrateBlocks'],
  legacyLibReadyToMigrateBlocksStatus: (courseId: string, taskId?: string) => [
    ...courseOutlineQueryKeys.legacyLibReadyToMigrateBlocks(courseId),
    'status',
    { taskId },
  ],
};

/**
 * Hook to create an XBLOCK in a course .
 * The `locator` is the ID of the parent block where this new XBLOCK should be created.
 * Can also be used to import block from library by passing `libraryContentKey` in request body
 */
export const useCreateCourseBlock = (
  callback?: ((locator?: string, parentLocator?: string) => void),
) => useMutation({
  mutationFn: createCourseXblock,
  onSettled: async (data) => {
    callback?.(data?.locator, data.parent_locator);
  },
});

export const useCourseItemData = (itemId?: string, enabled: boolean = true) => (
  useQuery({
    queryKey: courseOutlineQueryKeys.courseItemId(itemId),
    queryFn: enabled && itemId !== undefined ? () => getCourseItem(itemId!) : skipToken,
  })
);

export const useCourseDetails = (courseId?: string, enabled: boolean = true) => (
  useQuery({
    queryKey: courseOutlineQueryKeys.courseDetails(courseId),
    queryFn: enabled && courseId ? () => getCourseDetails(courseId) : skipToken,
  })
);

export const useCourseLegacyLibReadyToMigrateBlocks = (courseId: string, enabled: boolean = true) => (
  useQuery({
    queryKey: courseOutlineQueryKeys.legacyLibReadyToMigrateBlocks(courseId),
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
  queryKey: courseOutlineQueryKeys.legacyLibReadyToMigrateBlocksStatus(courseId, taskId),
  queryFn: taskId ? () => getCourseLegacyLibRefUpdateTaskStatus(courseId, taskId) : skipToken,
  refetchInterval: (query) => ([
    UserTaskStatus.Succeeded,
    UserTaskStatus.Failed,
    UserTaskStatus.Cancelled,
  ].includes(query.state.data?.state || UserTaskStatus.InProgress) ? false : 2000),
});
