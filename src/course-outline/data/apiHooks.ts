import { containerComparisonQueryKeys } from '@src/container-comparison/data/apiHooks';
import { courseOutlineQueryKeys } from './queryKeys';
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
import { useMutationWithProcessingNotification } from '@src/generic/processing-notification/data/apiHooks';
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
} from './outlineIndexCacheUtils';
export {
  appendSectionToOutlineIndex,
  replaceSectionInOutlineIndex,
  removeItemFromOutlineIndexData,
  insertDuplicatedSectionInOutlineIndex,
};
import { useCourseOutlineSavingStatus, useCourseOutlineReindexStatus } from './outlineStatusHooks';
export { useCourseOutlineSavingStatus, useCourseOutlineReindexStatus };

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
 *
 * Callers are responsible for catching errors (they already do via .catch).
 */
export const invalidateParentQueries = async (queryClient: QueryClient, variables: ParentIds) => {
  if (variables.sectionId) {
    await queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.courseItemId(variables.sectionId) });
  } else if (variables.subsectionId) {
    // istanbul ignore next
    await queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.courseItemId(variables.subsectionId) });
  }
};

// ---- Pure helpers for outline-index cache manipulation ----

/** Fire-and-forget invalidateParentQueries — errors are best-effort. */
const safeInvalidateParentQueries = (queryClient: QueryClient, variables: ParentIds) => {
  invalidateParentQueries(queryClient, variables).catch(() => {});
};

/**
 * Shared cache invalidation — called by most mutation hooks.
 * Invalidates parent queries + course details in one step.
 */
const invalidateOutlineAndParents = (
  queryClient: QueryClient,
  variables: ParentIds,
  courseKey: string,
) => {
  safeInvalidateParentQueries(queryClient, variables);
  queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.courseDetails(courseKey) });
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
  callback?: (locator: string, parentLocator: string) => Promise<void>,
) => {
  const queryClient = useQueryClient();
  const { setData } = useScrollState(courseKey);
  return useMutationWithProcessingNotification({
    mutationKey: courseOutlineQueryKeys.mutations.savingOperation(courseKey, 'createBlock'),
    mutationFn: (variables: CreateCourseXBlockMutationProps) => createCourseXblock(variables),
    onSuccess: async (data: { locator: string; }, variables) => {
      await callback?.(data.locator, variables.parentLocator);
      invalidateOutlineAndParents(queryClient, variables, getCourseKey(data.locator));

      // Invalidate tags count for the newly created block
      // Strips "+type@<blockType>+block@<id>" to produce a course-run wildcard, e.g.
      // "block-v1:org+course+run+type@vertical+block@abc" → "block-v1:org+course+run*"
      const contentPattern = data.locator.replace(/\+type@.*$/, '*');
      queryClient.invalidateQueries({ queryKey: ['contentTagsCount', contentPattern] });
      // scroll to newly added block
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
export const useUpdateCourseBlockName = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutationWithProcessingNotification({
    mutationKey: courseOutlineQueryKeys.mutations.savingOperation(courseId, 'updateName'),
    mutationFn: (
      variables: {
        itemId: string;
        displayName: string;
      } & ParentIds,
    ) => editItemDisplayName({ itemId: variables.itemId, displayName: variables.displayName }),
    onSuccess: async (_data, variables) => {
      invalidateOutlineAndParents(queryClient, variables, courseId);
      queryClient.invalidateQueries({ queryKey: containerComparisonQueryKeys.course(courseId) });
    },
  });
};

export const usePublishCourseItem = (courseId?: string) => {
  const queryClient = useQueryClient();
  return useMutationWithProcessingNotification({
    mutationKey: courseOutlineQueryKeys.mutations.savingOperation(courseId, 'publish'),
    mutationFn: (
      variables: {
        itemId: string;
      } & ParentIds,
    ) => publishCourseItem(variables.itemId),
    onSettled: (_data, _err, variables) => {
      invalidateOutlineAndParents(queryClient, variables, getCourseKey(variables.itemId));
    },
  });
};

export const useDeleteCourseItem = (courseId?: string) => {
  const queryClient = useQueryClient();
  return useMutationWithProcessingNotification({
    mutationKey: courseOutlineQueryKeys.mutations.savingOperation(courseId, 'delete'),
    mutationFn: (
      variables: {
        itemId: string;
      } & ParentIds,
    ) => deleteCourseItem(variables.itemId),
    onSuccess: (_data, variables) => {
      invalidateOutlineAndParents(queryClient, variables, getCourseKey(variables.itemId));
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
};

export const useConfigureSection = (courseId?: string) => {
  const queryClient = useQueryClient();
  return useMutationWithProcessingNotification({
    mutationKey: courseOutlineQueryKeys.mutations.savingOperation(courseId, 'configureSection'),
    mutationFn: (variables: ConfigureSectionData & ParentIds) => configureCourseSection(variables),
    onSettled: (_data, _err, variables) => {
      invalidateOutlineAndParents(queryClient, variables, getCourseKey(variables.sectionId));
    },
  });
};

export const useConfigureSubsection = (courseId?: string) => {
  const queryClient = useQueryClient();
  return useMutationWithProcessingNotification({
    mutationKey: courseOutlineQueryKeys.mutations.savingOperation(courseId, 'configureSubsection'),
    mutationFn: (
      variables: Partial<ConfigureSubsectionData> & Pick<ConfigureSubsectionData, 'itemId'> & ParentIds,
    ) => configureCourseSubsection(variables),
    onSettled: async (_data, _err, variables) => {
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
};

export const useConfigureUnit = (courseId?: string) => {
  const queryClient = useQueryClient();
  const { showToast, closeToast } = useToastContext();
  // We are not using useMutationWithProcessingNotification to set custom processing notification message
  return useMutation({
    mutationKey: courseOutlineQueryKeys.mutations.savingOperation(courseId, 'configureUnit'),
    mutationFn: (variables: ConfigureUnitData & ParentIds) => configureCourseUnit(variables),
    onMutate: (variables) => {
      const msg = getNotificationMessage(variables.type, variables.isVisibleToStaffOnly, true);
      // Show processing notification
      showToast(msg, undefined, 15000);
    },
    onSettled: (_data, _err, variables) => {
      invalidateOutlineAndParents(queryClient, variables, getCourseKey(variables.unitId));
      closeToast();
    },
  });
};

export const useUpdateCourseSectionHighlights = (courseId?: string) => {
  const queryClient = useQueryClient();
  return useMutationWithProcessingNotification({
    mutationKey: courseOutlineQueryKeys.mutations.savingOperation(courseId, 'highlights'),
    mutationFn: (
      variables: {
        sectionId: string;
        highlights: string[];
      } & ParentIds,
    ) => updateCourseSectionHighlights(variables.sectionId, variables.highlights),
    onSettled: (_data, _err, variables) => {
      invalidateOutlineAndParents(queryClient, variables, getCourseKey(variables.sectionId));
    },
  });
};

export const useDuplicateItem = (courseKey: string) => {
  const queryClient = useQueryClient();
  const { setData } = useScrollState(courseKey);
  return useMutationWithProcessingNotification({
    mutationKey: courseOutlineQueryKeys.mutations.savingOperation(courseKey, 'duplicate'),
    mutationFn: (
      variables: {
        itemId: string;
        parentId: string;
      } & ParentIds,
    ) => duplicateCourseItem(variables.itemId, variables.parentId),
    onSuccess: async (data, variables) => {
      invalidateOutlineAndParents(queryClient, variables, courseKey);

      // For chapter (section) duplication, insert the duplicated section into the outline index cache.
      if (getBlockType(variables.itemId) === 'chapter') {
        const duplicatedItem = await getCourseItem(data.locator);
        insertDuplicatedSectionInOutlineIndex(queryClient, courseKey, variables.itemId, duplicatedItem);
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

export const useReorderUnits = (courseId?: string) => {
  return useMutationWithProcessingNotification({
    mutationKey: courseOutlineQueryKeys.mutations.savingOperation(courseId, 'reorderUnits'),
    mutationFn: (variables: {
      sectionId: string;
      subsectionId: string;
      unitListIds: string[];
    }) => setCourseItemOrderList(variables.subsectionId, variables.unitListIds),
  });
};

export const useReorderSections = (courseId: string) => {
  return useMutationWithProcessingNotification({
    mutationKey: courseOutlineQueryKeys.mutations.savingOperation(courseId, 'reorderSections'),
    mutationFn: (sectionListIds: string[]) => setSectionOrderList(courseId, sectionListIds),
  });
};

export const useReorderSubsections = (courseId?: string) => {
  return useMutationWithProcessingNotification({
    mutationKey: courseOutlineQueryKeys.mutations.savingOperation(courseId, 'reorderSubsections'),
    mutationFn: (variables: {
      sectionId: string;
      subsectionListIds: string[];
    }) => setCourseItemOrderList(variables.sectionId, variables.subsectionListIds),
  });
};

export const usePasteItem = (courseId?: string) => {
  const queryClient = useQueryClient();
  const { setData: setScrollState } = useScrollState(courseId);
  const { setData } = usePasteFileNotices(courseId);
  return useMutationWithProcessingNotification({
    mutationKey: courseOutlineQueryKeys.mutations.savingOperation(courseId, 'paste'),
    mutationFn: (
      variables: {
        parentLocator: string;
      } & ParentIds,
    ) => pasteBlock(variables.parentLocator),
    onSuccess: async (data, variables) => {
      safeInvalidateParentQueries(queryClient, variables);
      // set pasteFileNotices
      setData(data.staticFileNotices);
      // scroll to pasted block
      setScrollState({ id: data.locator });
    },
  });
};

/**
 * Set video sharing option for a course.
 * Invalidates outline index cache so the next read fetches fresh data.
 */
export function useSetVideoSharingOption(courseId: string) {
  const queryClient = useQueryClient();
  return useMutationWithProcessingNotification({
    mutationKey: courseOutlineQueryKeys.mutations.savingOperation(courseId, 'videoSharing'),
    mutationFn: (value: string) => setVideoSharingOption(courseId, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.index(courseId) });
    },
  });
}

/**
 * Enable course highlights emails for a course.
 * Invalidates the outline index cache on success.
 */
export function useEnableCourseHighlightsEmails(courseId: string) {
  const queryClient = useQueryClient();
  return useMutationWithProcessingNotification({
    mutationKey: courseOutlineQueryKeys.mutations.savingOperation(courseId, 'highlightsEmail'),
    mutationFn: () => enableCourseHighlightsEmails(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.index(courseId) });
    },
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
 * Restart indexing on a course (reindex).
 * Uses bare useMutation (no processing toast) since reindex status is tracked
 * via useCourseOutlineReindexStatus.
 */
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

export function useRestartIndexingOnCourse(courseId: string) {
  return useMutation({
    mutationKey: courseOutlineQueryKeys.mutations.reindex(courseId),
    mutationFn: (reindexLink: string) => restartIndexingOnCourse(reindexLink),
  });
}
