import { containerComparisonQueryKeys } from '@src/container-comparison/data/apiHooks';
import type { XBlockBase, XblockChildInfo } from '@src/data/types';
import { getCourseKey } from '@src/generic/key-utils';
import { handleResponseErrors } from '@src/generic/saving-error-alert';
import { ParentIds } from '@src/generic/types';
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

/**
 * Invalidate parent Subsection and Section data.
 *
 * This function ensures that cached data for parent subsection and section is invalidated
 * when child items are created, updated, or deleted.
 *
 * Priority:
 * 1. If sectionId exists, invalidate section data which also updates all children block data
 * 2. Else If subsectionId exists, invalidate subsection data
 */
const invalidateParentQueries = async (queryClient: QueryClient, variables: ParentIds) => {
  if (variables.sectionId) {
    await queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.courseItemId(variables.sectionId) });
  } else if (variables.subsectionId) {
    // istanbul ignore next
    await queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.courseItemId(variables.subsectionId) });
  }
};

type CreateCourseXBlockMutationProps = CreateCourseXBlockType & ParentIds;

/**
 * Hook to create an XBLOCK in a course .
 * The `locator` is the ID of the parent block where this new XBLOCK should be created.
 * Can also be used to import block from library by passing `libraryContentKey` in request body
 *
 * @param callback - Optional function called after successful creation to handle additional logic
 * @returns Mutation object for creating course blocks
 */
export const useCreateCourseBlock = (
  callback?: ((locator: string, parentLocator: string) => Promise<void>),
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: CreateCourseXBlockMutationProps) => createCourseXblock(variables),
    onSettled: async (data: { locator: string; }, _err, variables) => {
      await callback?.(data.locator, variables.parentLocator);
      queryClient.invalidateQueries({
        queryKey: courseOutlineQueryKeys.courseDetails(getCourseKey(data.locator)),
      });
      invalidateParentQueries(queryClient, variables).catch((e) => handleResponseErrors(e));
    },
  });
};

export const useCourseItemData = <T extends XBlockBase>(itemId?: string, initialData?: T, enabled: boolean = true) => {
  const queryClient = useQueryClient();
  return useQuery<T>({
    initialData,
    queryKey: courseOutlineQueryKeys.courseItemId(itemId),
    queryFn: enabled && itemId ? async () => {
      const data = await getCourseItem<T>(itemId!);
      // If the container has children blocks, update children react-query cache
      // data without hitting the API as each xblock call returns its children information as well.
      if ('childInfo' in data) {
        // This could mean that data is of a section or subsection
        (data.childInfo as XblockChildInfo).children.forEach(async (child) => {
          await queryClient.cancelQueries({ queryKey: courseOutlineQueryKeys.courseItemId(child.id) });
          queryClient.setQueryData(courseOutlineQueryKeys.courseItemId(child.id), child);
          if ('childInfo' in child) {
            // This means that the data is of section and so its children subsections also
            // have children i.e. units
            (child.childInfo as XblockChildInfo).children.forEach(async (grandChild) => {
              await queryClient.cancelQueries({ queryKey: courseOutlineQueryKeys.courseItemId(grandChild.id) });
              queryClient.setQueryData(courseOutlineQueryKeys.courseItemId(grandChild.id), grandChild);
            });
          }
        });
      }
      return data;
    } : skipToken,
  });
};

export const useCourseDetails = (courseId?: string, enabled: boolean = true) => (
  useQuery({
    queryKey: courseOutlineQueryKeys.courseDetails(courseId),
    queryFn: enabled && courseId ? () => getCourseDetails(courseId) : skipToken,
  })
);

/**
 * Hook to update the display name of a course block.
 *
 * This mutation updates the display name of a course item and invalidates relevant cache queries
 * to ensure the UI reflects the changes.
 *
 * @param courseId - The ID of the course containing the item
 * @returns Mutation object for updating course block names
 */
export const useUpdateCourseBlockName = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables:{
      itemId: string;
      displayName: string;
    } & ParentIds) => editItemDisplayName({ itemId: variables.itemId, displayName: variables.displayName }),
    onSuccess: async (_data, variables) => {
      await invalidateParentQueries(queryClient, variables);
      queryClient.invalidateQueries({ queryKey: containerComparisonQueryKeys.course(courseId) });
      queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.courseDetails(courseId) });
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
      invalidateParentQueries(queryClient, variables).catch((e) => handleResponseErrors(e));
      queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.courseDetails(getCourseKey(variables.itemId)) });
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
