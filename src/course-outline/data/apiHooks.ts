import { containerComparisonQueryKeys } from '@src/container-comparison/data/apiHooks';
import { addSection, duplicateSection, updateSectionList } from '@src/course-outline/data/slice';
import {
  ConfigureSectionData,
  ConfigureSubsectionData,
  ConfigureUnitData,
  StaticFileNotices,
} from '@src/course-outline/data/types';
import { getNotificationMessage } from '@src/course-unit/data/utils';
import { createGlobalState } from '@src/data/apiHooks';
import type { XBlockBase, XblockChildInfo } from '@src/data/types';
import { getBlockType, getCourseKey } from '@src/generic/key-utils';
import { useMutationWithProcessingNotification } from '@src/generic/processing-notification/data/apiHooks';
import { handleResponseErrors } from '@src/generic/saving-error-alert';
import { useToastContext } from '@src/generic/toast-context';
import { ParentIds } from '@src/generic/types';
import {
  QueryClient,
  skipToken, useMutation, useQuery, useQueryClient,
} from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import {
  createCourseXblock,
  type CreateCourseXBlockType,
  deleteCourseItem,
  editItemDisplayName,
  getCourseDetails,
  getCourseItem,
  publishCourseItem,
  configureCourseSection,
  configureCourseSubsection,
  configureCourseUnit,
  updateCourseSectionHighlights,
  duplicateCourseItem,
  pasteBlock,
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
  scrollToCourseItemId: (courseId?: string) => [
    ...courseOutlineQueryKeys.course(courseId),
    'scroll',
  ],
  pasteFileNotices: (courseId?: string) => [
    ...courseOutlineQueryKeys.course(courseId),
    'pasteFileNotices',
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

type ScrollState = {
  id?: string;
};

export const useScrollState = createGlobalState<ScrollState>(courseOutlineQueryKeys.scrollToCourseItemId, {
  id: undefined,
});

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
export const invalidateParentQueries = async (queryClient: QueryClient, variables: ParentIds) => {
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
  courseKey: string,
  callback?: ((locator: string, parentLocator: string) => Promise<void>),
) => {
  const queryClient = useQueryClient();
  const { setData } = useScrollState(courseKey);
  const dispatch = useDispatch();
  return useMutationWithProcessingNotification({
    mutationFn: (variables: CreateCourseXBlockMutationProps) => createCourseXblock(variables),
    onSuccess: async (data: { locator: string; }, variables) => {
      await callback?.(data.locator, variables.parentLocator);
      queryClient.invalidateQueries({
        queryKey: courseOutlineQueryKeys.courseDetails(getCourseKey(data.locator)),
      });
      await invalidateParentQueries(queryClient, variables);
      // scroll to newly added block
      setData({ id: data.locator });
      // if newly created block is chapter or section, fetch and add it to store
      // all other types are handled by invalidateParentQueries and useCourseItemData
      if (getBlockType(data.locator) === 'chapter') {
        const newBlock = await getCourseItem(data.locator);
        dispatch(addSection(newBlock));
      }
    },
  });
};

export const useCourseItemData = <T extends XBlockBase>(itemId?: string, initialData?: T, enabled: boolean = true) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
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
      // We update redux store section list to update children list in outline.
      // Even though each block has its own hook to fetch data, new child blocks or deleted blocks
      // won't be detected as the child blocks are rendered in the outline from the top level
      // sectionList from redux store.
      if (['chapter', 'section'].includes(data.category)) {
        const payload = { [data.id]: data };
        dispatch(updateSectionList(payload));
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
  return useMutationWithProcessingNotification({
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
  return useMutationWithProcessingNotification({
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
  return useMutationWithProcessingNotification({
    mutationFn: (variables:{
      itemId: string;
    } & ParentIds) => deleteCourseItem(variables.itemId),
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.courseDetails(getCourseKey(variables.itemId)) });
      invalidateParentQueries(queryClient, variables).catch((e) => handleResponseErrors(e));
    },
  });
};

export const useConfigureSection = () => {
  const queryClient = useQueryClient();
  return useMutationWithProcessingNotification({
    mutationFn: (variables: ConfigureSectionData & ParentIds) => configureCourseSection(variables),
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: courseOutlineQueryKeys.courseDetails(getCourseKey(variables.sectionId)),
      });
      invalidateParentQueries(queryClient, variables).catch((e) => handleResponseErrors(e));
    },
  });
};

export const useConfigureSubsection = () => {
  const queryClient = useQueryClient();
  return useMutationWithProcessingNotification({
    mutationFn: (variables: ConfigureSubsectionData & ParentIds) => configureCourseSubsection(variables),
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.courseDetails(getCourseKey(variables.itemId)) });
      invalidateParentQueries(queryClient, variables).catch((e) => handleResponseErrors(e));
    },
  });
};

export const useConfigureUnit = () => {
  const queryClient = useQueryClient();
  const { showToast, closeToast } = useToastContext();
  return useMutation({
    mutationFn: (variables: ConfigureUnitData & ParentIds) => configureCourseUnit(variables),
    onMutate: (variables) => {
      const msg = getNotificationMessage(variables.type, variables.isVisibleToStaffOnly, true);
      // Show processing notification
      showToast(msg, undefined, 15000);
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.courseDetails(getCourseKey(variables.unitId)) });
      invalidateParentQueries(queryClient, variables).catch((e) => handleResponseErrors(e));
      closeToast();
    },
  });
};

export const useUpdateCourseSectionHighlights = () => {
  const queryClient = useQueryClient();
  return useMutationWithProcessingNotification({
    mutationFn: (variables: {
      sectionId: string;
      highlights: string[];
    } & ParentIds) => updateCourseSectionHighlights(variables.sectionId, variables.highlights),
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: courseOutlineQueryKeys.courseDetails(getCourseKey(variables.sectionId)),
      });
      invalidateParentQueries(queryClient, variables).catch((e) => handleResponseErrors(e));
    },
  });
};

export const useDuplicateItem = (courseKey: string) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { setData } = useScrollState(courseKey);
  return useMutationWithProcessingNotification({
    mutationFn: (variables: {
      itemId: string;
      parentId: string;
    } & ParentIds) => duplicateCourseItem(variables.itemId, variables.parentId),
    onSuccess: async (data, variables) => {
      await invalidateParentQueries(queryClient, variables);
      // add duplicated section to store, subsection and unit are handled by invalidateParentQueries
      if (getBlockType(variables.itemId) === 'chapter') {
        const duplicatedItem = await getCourseItem(data.locator);
        dispatch(duplicateSection({ id: variables.itemId, duplicatedItem }));
      }
      // scroll to newly added block
      setData({ id: data.locator });
    },
  });
};

export const usePasteFileNotices = createGlobalState<StaticFileNotices>(
  courseOutlineQueryKeys.pasteFileNotices,
  {
    newFiles: [],
    conflictingFiles: [],
    errorFiles: [],
  },
);

export const usePasteItem = (courseId?: string) => {
  const queryClient = useQueryClient();
  const { setData: setScrollState } = useScrollState(courseId);
  const { setData } = usePasteFileNotices(courseId);
  return useMutationWithProcessingNotification({
    mutationFn: (variables: {
      parentLocator: string;
    } & ParentIds) => pasteBlock(variables.parentLocator),
    onSuccess: async (data, variables) => {
      await invalidateParentQueries(queryClient, variables);
      // set pasteFileNotices
      setData(data.staticFileNotices);
      // scroll to pasted block
      setScrollState({ id: data.locator });
    },
  });
};
