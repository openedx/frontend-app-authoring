import { containerComparisonQueryKeys } from '@src/container-comparison/data/apiHooks';
import { courseOutlineQueryKeys } from './queryKeys';
import { useOutlineMutation } from './useOutlineMutation';
import { invalidateOutlineAndParents } from './cacheInvalidation';
import {
  ConfigureSectionData,
  ConfigureSubsectionData,
  ConfigureUnitData,
  StaticFileNotices,
} from '@src/course-outline/data/types';
import { getNotificationMessage } from '@src/course-unit/data/utils';
import { createGlobalState } from '@src/data/apiHooks';
import type { XBlockBase, XblockChildInfo } from '@src/data/types';
import {
  ContainerType,
  getBlockType,
  getCourseKey,
  normalizeContainerType,
} from '@src/generic/key-utils';
import { useToastContext } from '@src/generic/toast-context';
import { ParentIds } from '@src/generic/types';
import { getConfig } from '@edx/frontend-platform';

import {
  QueryClient,
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  createCourseXblock,
  type CreateCourseXBlockType,
  deleteCourseItem,
  dismissNotification,
  editItemDisplayName,
  enableCourseHighlightsEmails,
  getCourseBestPractices,
  getCourseDetails,
  getCourseItem,
  getCourseLaunch,
  publishCourseItem,
  configureCourseSection,
  configureCourseSubsection,
  configureCourseUnit,
  restartIndexingOnCourse,
  setCourseItemOrderList,
  setSectionOrderList,
  setVideoSharingOption,
  updateCourseSectionHighlights,
  duplicateCourseItem,
  pasteBlock,
} from './api';

import {
  appendSectionToOutlineIndex,
  replaceSectionInOutlineIndex,
  removeItemFromOutlineIndexData,
  insertDuplicatedSectionInOutlineIndex,
  updateNodeInCourseItemCache,
  updateNodeInOutlineIndex,
} from './outlineIndexCacheUtils';
import { useCourseOutlineSavingStatus, useCourseOutlineReindexStatus } from './outlineStatusHooks';

export {
  appendSectionToOutlineIndex,
  replaceSectionInOutlineIndex,
  removeItemFromOutlineIndexData,
  insertDuplicatedSectionInOutlineIndex,
};
export { useCourseOutlineSavingStatus, useCourseOutlineReindexStatus };
export { invalidateParentQueries, invalidateOutlineAndParents } from './cacheInvalidation';

type ScrollState = {
  id?: string;
};

export const useScrollState = createGlobalState<ScrollState>(courseOutlineQueryKeys.scrollToCourseItemId, {
  id: undefined,
});

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
  callback?: (locator: string, parentLocator: string) => Promise<void>,
) => {
  const { setData } = useScrollState(courseKey);
  return useOutlineMutation<CreateCourseXBlockMutationProps, { locator: string; }>(courseKey, {
    operation: 'createBlock',
    mutationFn: (variables) => createCourseXblock(variables),
    onSuccess: async (data, variables, queryClient) => {
      await callback?.(data.locator, variables.parentLocator);

      const contentPattern = data.locator.replace(/\+type@.*$/, '*');
      queryClient.invalidateQueries({ queryKey: ['contentTagsCount', contentPattern] });
      setData({ id: data.locator });
      // If newly created block is chapter, append to outline index cache.
      if (getBlockType(data.locator) === 'chapter') {
        const newBlock = await getCourseItem(data.locator);
        appendSectionToOutlineIndex(queryClient, courseKey, newBlock);
      }
    },
  });
};

/** Recursively prime the query cache with child blocks so they can be read without extra API calls. */
async function primeChildCache(
  queryClient: QueryClient,
  node: XBlockBase,
): Promise<void> {
  if (!('childInfo' in node)) { return; }
  const childInfo = (node as any).childInfo;
  if (!childInfo) { return; }
  const children = (childInfo as XblockChildInfo).children;
  if (!children || !Array.isArray(children)) { return; }
  for (const child of children) {
    await queryClient.cancelQueries({ queryKey: courseOutlineQueryKeys.courseItemId(child.id) });
    queryClient.setQueryData(courseOutlineQueryKeys.courseItemId(child.id), child);
    await primeChildCache(queryClient, child);
  }
}

export const useCourseItemData = <T extends XBlockBase>(itemId?: string, initialData?: T, enabled: boolean = true) => {
  const queryClient = useQueryClient();
  const query = useQuery<T>({
    initialData,
    queryKey: courseOutlineQueryKeys.courseItemId(itemId),
    queryFn: enabled && itemId ?
      async () => {
        const data = await getCourseItem<T>(itemId!);
        // Prime child block caches recursively (any depth), so subsequent reads
        // resolve from cache without extra API calls.
        await primeChildCache(queryClient, data);
        // Sync section data to outline index cache (committed tree reads from query cache).
        if (['chapter', 'section'].includes(data.category)) {
          const outlineCourseId = getCourseKey(data.id);
          replaceSectionInOutlineIndex(queryClient, outlineCourseId, { [data.id]: data as any });
        }
        return data;
      } :
      skipToken,
  });

  return query;
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
export const useUpdateCourseBlockName = (courseId: string) =>
  useOutlineMutation<{ itemId: string; displayName: string; } & ParentIds, unknown>(courseId, {
    operation: 'updateName',
    mutationFn: (variables) => editItemDisplayName({ itemId: variables.itemId, displayName: variables.displayName }),
    onSuccess: (_data, variables, queryClient) => {
      // Immediately update the item's own cache with new displayName
      queryClient.setQueryData(
        courseOutlineQueryKeys.courseItemId(variables.itemId),
        (old: any) => old ? { ...old, displayName: variables.displayName } : old,
      );

      // Recursively update displayName in the outline index tree
      updateNodeInOutlineIndex(
        queryClient,
        courseId,
        variables.itemId,
        (node) => ({ ...node, displayName: variables.displayName }),
      );

      // Update parent item caches (section and subsection) so child displayName
      // changes are reflected without a backend refetch.
      if (variables.sectionId) {
        updateNodeInCourseItemCache(
          queryClient,
          variables.sectionId,
          variables.itemId,
          (node) => ({ ...node, displayName: variables.displayName }),
        );
      }
      if (variables.subsectionId) {
        updateNodeInCourseItemCache(
          queryClient,
          variables.subsectionId,
          variables.itemId,
          (node) => ({ ...node, displayName: variables.displayName }),
        );
      }

      // Preserve existing invalidations
      queryClient.invalidateQueries({ queryKey: containerComparisonQueryKeys.course(courseId) });
    },
  });

export const usePublishCourseItem = (courseId?: string) =>
  useOutlineMutation<{ itemId: string; } & ParentIds, unknown>(courseId, {
    operation: 'publish',
    mutationFn: (variables) => publishCourseItem(variables.itemId),
  });

export const useDeleteCourseItem = (courseId?: string) =>
  useOutlineMutation<{ itemId: string; } & ParentIds, unknown>(courseId, {
    operation: 'delete',
    mutationFn: (variables) => deleteCourseItem(variables.itemId),
    onSuccess: (_data, variables, queryClient) => {
      // Optimistic outline-index cache update: remove deleted item from the tree
      const itemId = variables.itemId;
      const category = getBlockType(itemId);
      if (courseId && ['chapter', 'sequential', 'vertical'].includes(category)) {
        queryClient.setQueryData(
          courseOutlineQueryKeys.index(courseId),
          (old: any) => removeItemFromOutlineIndexData(old, itemId, variables),
        );
      }
    },
  });

export const useConfigureSection = (courseId?: string) =>
  useOutlineMutation<ConfigureSectionData & ParentIds, unknown>(courseId, {
    operation: 'configureSection',
    mutationFn: (variables) => configureCourseSection(variables),
  });

export const useConfigureSubsection = (courseId?: string) =>
  useOutlineMutation<
    Partial<ConfigureSubsectionData> & Pick<ConfigureSubsectionData, 'itemId'> & ParentIds,
    unknown
  >(courseId, {
    operation: 'configureSubsection',
    mutationFn: (variables) => configureCourseSubsection(variables),
    onSettled: async (_data, _err, variables, queryClient) => {
      const courseKey = getCourseKey(variables.itemId);
      invalidateOutlineAndParents(queryClient, variables, courseKey);
      if (variables.isPrereq !== undefined) {
        const subsectionItemQueries = queryClient.getQueryCache().findAll({
          predicate: (query) => {
            const { queryKey } = query;
            return Array.isArray(queryKey)
              && queryKey.length >= 3
              && queryKey[0] === courseOutlineQueryKeys.all[0]
              && queryKey[1] === courseKey
              && typeof queryKey[2] === 'string'
              && normalizeContainerType(getBlockType(queryKey[2], 'empty')) === ContainerType.Subsection;
          },
        });
        await Promise.all(subsectionItemQueries.map((query) =>
          queryClient.invalidateQueries({
            queryKey: query.queryKey,
          })
        ));
      }
    },
  });

export const useConfigureUnit = (courseId?: string) => {
  const queryClient = useQueryClient();
  const { showToast, closeToast } = useToastContext();
  // We are not using useMutationWithProcessingNotification to set custom processing notification message
  return useMutation({
    mutationKey: courseOutlineQueryKeys.mutations.savingOperation(courseId, 'configureUnit'),
    mutationFn: (variables: ConfigureUnitData & ParentIds) => configureCourseUnit(variables),
    onMutate: (variables) => {
      const msg = getNotificationMessage(variables.type, variables.isVisibleToStaffOnly, true);
      showToast(msg, undefined, 15000);
    },
    onSettled: (_data, _err, variables) => {
      invalidateOutlineAndParents(queryClient, variables, getCourseKey(variables.unitId));
      closeToast();
    },
  });
};

export const useUpdateCourseSectionHighlights = (courseId?: string) =>
  useOutlineMutation<{ sectionId: string; highlights: string[]; } & ParentIds, unknown>(courseId, {
    operation: 'highlights',
    mutationFn: (variables) => updateCourseSectionHighlights(variables.sectionId, variables.highlights),
  });

export const useDuplicateItem = (courseKey: string) => {
  const { setData } = useScrollState(courseKey);
  return useOutlineMutation<{ itemId: string; parentId: string; } & ParentIds, { locator: string; }>(courseKey, {
    operation: 'duplicate',
    mutationFn: (variables) => duplicateCourseItem(variables.itemId, variables.parentId),
    onSuccess: async (data, variables, queryClient) => {
      // For chapter (section) duplication, insert the duplicated section into the outline index cache.
      if (getBlockType(variables.itemId) === 'chapter') {
        const duplicatedItem = await getCourseItem(data.locator);
        insertDuplicatedSectionInOutlineIndex(queryClient, courseKey, variables.itemId, duplicatedItem);
      }

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

export const useReorderUnits = (courseId?: string) =>
  useOutlineMutation<{ sectionId: string; subsectionId: string; unitListIds: string[]; }, unknown>(courseId, {
    operation: 'reorderUnits',
    mutationFn: (variables) => setCourseItemOrderList(variables.subsectionId, variables.unitListIds),
    onSettled: () => {}, // suppress default parent invalidation
  });

export const useReorderSections = (courseId: string) =>
  useOutlineMutation<string[], unknown>(courseId, {
    operation: 'reorderSections',
    mutationFn: (sectionListIds) => setSectionOrderList(courseId, sectionListIds),
    onSettled: () => {}, // suppress default parent invalidation
  });

export const useReorderSubsections = (courseId?: string) =>
  useOutlineMutation<{ sectionId: string; subsectionListIds: string[]; }, unknown>(courseId, {
    operation: 'reorderSubsections',
    mutationFn: (variables) => setCourseItemOrderList(variables.sectionId, variables.subsectionListIds),
    onSettled: () => {}, // suppress default parent invalidation
  });

export const usePasteItem = (courseId?: string) => {
  const { setData: setScrollState } = useScrollState(courseId);
  const { setData } = usePasteFileNotices(courseId);
  return useOutlineMutation<
    { parentLocator: string; } & ParentIds,
    { locator: string; staticFileNotices: StaticFileNotices; }
  >(courseId, {
    operation: 'paste',
    mutationFn: (variables) => pasteBlock(variables.parentLocator),
    onSuccess: (data) => {
      setData(data.staticFileNotices);
      setScrollState({ id: data.locator });
    },
  });
};

/**
 * Set video sharing option for a course.
 * Invalidates outline index cache so the next read fetches fresh data.
 */
export function useSetVideoSharingOption(courseId: string) {
  return useOutlineMutation<string, unknown>(courseId, {
    operation: 'videoSharing',
    mutationFn: (value) => setVideoSharingOption(courseId, value),
    onSuccess: (_data, _value, queryClient) => {
      queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.index(courseId) });
    },
    onSettled: () => {}, // suppress default parent invalidation; variables are not ParentIds
  });
}

/**
 * Enable course highlights emails for a course.
 * Invalidates the outline index cache on success.
 */
export function useEnableCourseHighlightsEmails(courseId: string) {
  return useOutlineMutation<void, unknown>(courseId, {
    operation: 'highlightsEmail',
    mutationFn: () => enableCourseHighlightsEmails(courseId),
    onSuccess: (_data, _vars, queryClient) => {
      queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.index(courseId) });
    },
    onSettled: () => {}, // suppress default parent invalidation; variables are not ParentIds
  });
}

/**
 * Dismiss a notification for a course.
 * Uses bare useMutation (no processing toast) to match existing behavior.
 */
export function useDismissNotification(courseId: string) {
  return useMutation({
    mutationKey: courseOutlineQueryKeys.mutations.savingOperation(courseId, 'dismissNotification'),
    mutationFn: (dismissUrl: string) => {
      const url = `${getConfig().STUDIO_BASE_URL}${dismissUrl}`;
      return dismissNotification(url);
    },
  });
}

/**
 * Fetch course best practices checklist data.
 * Non-blocking — errors return undefined data silently; caller defaults when absent.
 */
export function useCourseBestPractices(courseId: string) {
  return useQuery({
    queryKey: courseOutlineQueryKeys.courseBestPractices(courseId),
    queryFn: () => getCourseBestPractices({ courseId, excludeGraded: true, all: true }),
    retry: false,
  });
}

/**
 * Fetch course launch validation data.
 * Loading/error states drive courseLaunchQueryStatus and courseLaunchApi error details.
 */
export function useCourseLaunch(courseId: string) {
  return useQuery({
    queryKey: courseOutlineQueryKeys.courseLaunch(courseId),
    queryFn: () => getCourseLaunch({ courseId, gradedOnly: true, validateOras: true, all: true }),
    retry: false,
  });
}

/**
 * Restart indexing on a course (reindex).
 * Uses bare useMutation (no processing toast) since reindex status is tracked
 * via useCourseOutlineReindexStatus.
 */
export function useRestartIndexingOnCourse(courseId: string) {
  return useMutation({
    mutationKey: courseOutlineQueryKeys.mutations.reindex(courseId),
    mutationFn: (reindexLink: string) => restartIndexingOnCourse(reindexLink),
  });
}
