import { containerComparisonQueryKeys } from '@src/container-comparison/data/apiHooks';
import type { XBlock } from '@src/data/types';
import { getCourseKey } from '@src/generic/key-utils';
import { handleResponseErrors } from '@src/generic/saving-error-alert';
import {
  QueryClient,
  skipToken, useMutation, useQuery, useQueryClient,
} from '@tanstack/react-query';
import {
  createCourseXblock,
  type CreateCourseXBlockType,
  deleteCourseItem,
  editItemDisplayName,
  getCourseDetails,
  getCourseItem,
  publishCourseItem,
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

type ParentIds = {
  /** This id will be used to invalidate data of parent subsection */
  subsectionId?: string;
  /** This id will be used to invalidate data of parent section */
  sectionId?: string;
};

/**
 * Invalidate parent Subsection and Section data.
 */
const invalidateParentQueries = async (queryClient: QueryClient, variables: ParentIds) => {
  if (variables.subsectionId) {
    await queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.courseItemId(variables.subsectionId) });
  }
  if (variables.sectionId) {
    await queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.courseItemId(variables.sectionId) });
  }
};

type CreateCourseXBlockMutationProps = CreateCourseXBlockType & ParentIds;

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
    mutationFn: (variables: CreateCourseXBlockMutationProps) => createCourseXblock(variables),
    onSettled: async (data: { locator: string; }, _err, variables) => {
      await callback?.(data.locator, variables.parentLocator);
      queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.courseItemId(variables.parentLocator) });
      queryClient.invalidateQueries({
        queryKey: courseOutlineQueryKeys.courseDetails(getCourseKey(data.locator)),
      });
      invalidateParentQueries(queryClient, variables).catch((e) => handleResponseErrors(e));
    },
  });
};

export const useCourseItemData = <T = XBlock>(itemId?: string, initialData?: T, enabled: boolean = true) => (
  useQuery({
    initialData,
    queryKey: courseOutlineQueryKeys.courseItemId(itemId),
    queryFn: enabled && itemId ? () => getCourseItem<T>(itemId!) : skipToken,
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
    mutationFn: (variables:{
      itemId: string;
      displayName: string;
    } & ParentIds) => editItemDisplayName({ itemId: variables.itemId, displayName: variables.displayName }),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: containerComparisonQueryKeys.course(courseId) });
      await queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.courseDetails(courseId) });
      await queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.courseItemId(variables.itemId) });
      await invalidateParentQueries(queryClient, variables);
    },
  });
};

export const usePublishCourseItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables:{
      itemId: string;
    } & ParentIds) => publishCourseItem(variables.itemId),
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.courseItemId(variables.itemId) });
      queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.courseDetails(getCourseKey(variables.itemId)) });
      invalidateParentQueries(queryClient, variables).catch((e) => handleResponseErrors(e));
    },
  });
};

export const useDeleteCourseItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables:{
      itemId: string;
    } & ParentIds) => deleteCourseItem(variables.itemId),
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.courseDetails(getCourseKey(variables.itemId)) });
      invalidateParentQueries(queryClient, variables).catch((e) => handleResponseErrors(e));
    },
  });
};
