import { containerComparisonQueryKeys } from '@src/container-comparison/data/apiHooks';
import type { XBlock } from '@src/data/types';
import { getCourseKey } from '@src/generic/key-utils';
import {
  skipToken, useMutation, useQuery, useQueryClient,
} from '@tanstack/react-query';
import {
  createCourseXblock, deleteCourseItem, editItemDisplayName, getCourseDetails, getCourseItem, publishCourseItem,
} from './api';

export const courseOutlineQueryKeys = {
  all: ['courseOutline'],
  /**
   * Base key for data specific to a course in outline
   */
  course: (courseId?: string) => [...courseOutlineQueryKeys.all, courseId],
  courseItemId: (itemId?: string) => [
    ...courseOutlineQueryKeys.course(itemId ? getCourseKey(itemId) : undefined),
    itemId,
  ],
  courseDetails: (courseId?: string) => [
    ...courseOutlineQueryKeys.course(courseId),
    'details',
  ],
  legacyLibReadyToMigrateBlocks: (courseId: string) => [
    ...courseOutlineQueryKeys.course(courseId),
    'legacyLibReadyToMigrateBlocks',
  ],
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
  callback?: ((locator: string, parentLocator: string) => Promise<void>),
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCourseXblock,
    onSettled: async (data: { locator: string; }, _err, variables) => {
      await callback?.(data.locator, variables.parentLocator);
      queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.courseItemId(variables.parentLocator) });
      queryClient.invalidateQueries({
        queryKey: courseOutlineQueryKeys.courseDetails(getCourseKey(data.locator)),
      });
    },
  });
};

export const useCourseItemData = (itemId?: string, initialData?: XBlock, enabled: boolean = true) => (
  useQuery({
    initialData,
    queryKey: courseOutlineQueryKeys.courseItemId(itemId),
    queryFn: enabled && itemId ? () => getCourseItem(itemId!) : skipToken,
  })
);

export const useCourseDetails = (courseId?: string, enabled: boolean = true) => (
  useQuery({
    queryKey: courseOutlineQueryKeys.courseDetails(courseId),
    queryFn: enabled && courseId ? () => getCourseDetails(courseId) : skipToken,
  })
);

export const useUpdateCourseBlockName = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: editItemDisplayName,
    onSettled: async (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: containerComparisonQueryKeys.course(courseId) });
      queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.courseDetails(courseId) });
      queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.courseItemId(variables.itemId) });
    },
  });
};

export const usePublishCourseItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: publishCourseItem,
    onSettled: async (_data, _err, itemId) => {
      queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.courseItemId(itemId) });
      queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.courseDetails(getCourseKey(itemId)) });
    },
  });
};

export const useDeleteCourseItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCourseItem,
    onSettled: async (_data, _err, itemId) => {
      queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.courseDetails(getCourseKey(itemId)) });
    },
  });
}
