import { containerComparisonQueryKeys } from '@src/container-comparison/data/apiHooks';
import { courseOutlineIndexQueryKey } from './outlineIndexQuery';
import {
  ConfigureSectionData,
  ConfigureSubsectionData,
  ConfigureUnitData,
  StaticFileNotices,
} from '@src/course-outline/data/types';
import { getNotificationMessage } from '@src/course-unit/data/utils';
import { createGlobalState } from '@src/data/apiHooks';
import type { XBlock, XBlockBase, XblockChildInfo } from '@src/data/types';
import {
  ContainerType,
  getBlockType,
  getCourseKey,
  normalizeContainerType,
} from '@src/generic/key-utils';
import { useMutationWithProcessingNotification } from '@src/generic/processing-notification/data/apiHooks';
import { handleResponseErrors } from '@src/generic/saving-error-alert';
import { useToastContext } from '@src/generic/toast-context';
import { ParentIds } from '@src/generic/types';
import { getConfig } from '@edx/frontend-platform';
import { RequestStatus } from '@src/data/constants';
import { getErrorDetails } from '../utils/getErrorDetails';
import {
  QueryClient,
  skipToken,
  useMutation,
  useMutationState,
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
  getCourseDetails,
  getCourseItem,
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

export const courseOutlineMutationKeys = {
  all: ['courseOutline', 'mutations'],
  saving: (courseId?: string) => [...courseOutlineMutationKeys.all, courseId, 'saving'],
  savingOperation: (
    courseId: string | undefined,
    operation: string,
  ) => [...courseOutlineMutationKeys.saving(courseId), operation],
  reindex: (courseId?: string) => [...courseOutlineMutationKeys.all, courseId, 'reindex'],
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

/** Append a new section to outline index query cache. */
const appendSectionToOutlineIndex = (
  queryClient: QueryClient,
  courseId: string,
  newSection: XBlockBase,
) => {
  queryClient.setQueryData(courseOutlineIndexQueryKey(courseId), (old: any) => {
    if (!old) { return old; }
    return {
      ...old,
      courseStructure: {
        ...old.courseStructure,
        childInfo: {
          ...(old.courseStructure.childInfo || { children: [] }),
          children: [...(old.courseStructure.childInfo?.children || []), newSection],
        },
      },
    };
  });
};

/** Replace top-level sections in outline index cache by id. */
export const replaceSectionInOutlineIndex = (
  queryClient: QueryClient,
  courseId: string,
  sections: Record<string, XBlock>,
) => {
  const old = queryClient.getQueryData(courseOutlineIndexQueryKey(courseId)) as any;
  if (!old?.courseStructure?.childInfo?.children) { return; }
  let hadMissingChildInfo = false;
  const updated = {
    ...old,
    courseStructure: {
      ...old.courseStructure,
      childInfo: {
        ...old.courseStructure.childInfo,
        children: old.courseStructure.childInfo.children.map(
          (s: any) => {
            if (!(s.id in sections)) { return s; }
            const replacement = sections[s.id];
            // Skip replacement if missing childInfo.children, invalidate as fallback
            if (!replacement?.childInfo?.children) {
              hadMissingChildInfo = true;
              return s;
            }
            return replacement;
          },
        ),
      },
    },
  };
  queryClient.setQueryData(courseOutlineIndexQueryKey(courseId), updated);
  if (hadMissingChildInfo) {
    queryClient.invalidateQueries({ queryKey: courseOutlineIndexQueryKey(courseId) });
  }
};

/**
 * Pure function: remove an item from outline-index data and return new tree.
 * Does not touch React Query cache. Caller wraps with setQueryData.
 */
function removeItemFromOutlineIndexData(
  old: any,
  itemId: string,
  variables: { sectionId?: string; subsectionId?: string; },
): any {
  if (!old?.courseStructure?.childInfo?.children) { return old; }
  const category = getBlockType(itemId);
  const children = [...old.courseStructure.childInfo.children];
  if (category === 'chapter') {
    return {
      ...old,
      courseStructure: {
        ...old.courseStructure,
        childInfo: { ...old.courseStructure.childInfo, children: children.filter((s: any) => s.id !== itemId) },
      },
    };
  }
  if (category === 'sequential') {
    return {
      ...old,
      courseStructure: {
        ...old.courseStructure,
        childInfo: {
          ...old.courseStructure.childInfo,
          children: children.map((s: any) =>
            s.id !== variables.sectionId ? s : {
              ...s,
              childInfo: {
                ...s.childInfo,
                children: (s.childInfo?.children || []).filter((sub: any) => sub.id !== itemId),
              },
            }
          ),
        },
      },
    };
  }
  if (category === 'vertical') {
    return {
      ...old,
      courseStructure: {
        ...old.courseStructure,
        childInfo: {
          ...old.courseStructure.childInfo,
          children: children.map((s: any) =>
            s.id !== variables.sectionId ? s : {
              ...s,
              childInfo: {
                ...s.childInfo,
                children: (s.childInfo?.children || []).map((sub: any) =>
                  sub.id !== variables.subsectionId ? sub : {
                    ...sub,
                    childInfo: {
                      ...sub.childInfo,
                      children: (sub.childInfo?.children || []).filter((u: any) => u.id !== itemId),
                    },
                  }
                ),
              },
            }
          ),
        },
      },
    };
  }
  return old;
}

/** Insert duplicated section after original id in outline index cache. */
const insertDuplicatedSectionInOutlineIndex = (
  queryClient: QueryClient,
  courseId: string,
  originalId: string,
  duplicatedSection: XBlockBase,
) => {
  queryClient.setQueryData(courseOutlineIndexQueryKey(courseId), (old: any) => {
    if (!old?.courseStructure?.childInfo?.children) { return old; }
    return {
      ...old,
      courseStructure: {
        ...old.courseStructure,
        childInfo: {
          ...old.courseStructure.childInfo,
          children: old.courseStructure.childInfo.children.reduce(
            (result: any[], current: any) => {
              if (current.id === originalId) {
                return [...result, current, duplicatedSection];
              }
              return [...result, current];
            },
            [],
          ),
        },
      },
    };
  });
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
    mutationKey: courseOutlineMutationKeys.savingOperation(courseKey, 'createBlock'),
    mutationFn: (variables: CreateCourseXBlockMutationProps) => createCourseXblock(variables),
    onSuccess: async (data: { locator: string; }, variables) => {
      await callback?.(data.locator, variables.parentLocator);
      queryClient.invalidateQueries({
        queryKey: courseOutlineQueryKeys.courseDetails(getCourseKey(data.locator)),
      });

      await invalidateParentQueries(queryClient, variables).catch((e) => handleResponseErrors(e));

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

export const useCourseItemData = <T extends XBlockBase>(itemId?: string, initialData?: T, enabled: boolean = true) => {
  const queryClient = useQueryClient();
  const query = useQuery<T>({
    initialData,
    queryKey: courseOutlineQueryKeys.courseItemId(itemId),
    queryFn: enabled && itemId ?
      async () => {
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
    mutationKey: courseOutlineMutationKeys.savingOperation(courseId, 'updateName'),
    mutationFn: (
      variables: {
        itemId: string;
        displayName: string;
      } & ParentIds,
    ) => editItemDisplayName({ itemId: variables.itemId, displayName: variables.displayName }),
    onSuccess: async (_data, variables) => {
      await invalidateParentQueries(queryClient, variables).catch((e) => handleResponseErrors(e));
      queryClient.invalidateQueries({ queryKey: containerComparisonQueryKeys.course(courseId) });
      queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.courseDetails(courseId) });
    },
  });
};

export const usePublishCourseItem = (courseId?: string) => {
  const queryClient = useQueryClient();
  return useMutationWithProcessingNotification({
    mutationKey: courseOutlineMutationKeys.savingOperation(courseId, 'publish'),
    mutationFn: (
      variables: {
        itemId: string;
      } & ParentIds,
    ) => publishCourseItem(variables.itemId),
    onSettled: (_data, _err, variables) => {
      invalidateParentQueries(queryClient, variables).catch((e) => handleResponseErrors(e));
      queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.courseDetails(getCourseKey(variables.itemId)) });
    },
  });
};

export const useDeleteCourseItem = (courseId?: string) => {
  const queryClient = useQueryClient();
  return useMutationWithProcessingNotification({
    mutationKey: courseOutlineMutationKeys.savingOperation(courseId, 'delete'),
    mutationFn: (
      variables: {
        itemId: string;
      } & ParentIds,
    ) => deleteCourseItem(variables.itemId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.courseDetails(getCourseKey(variables.itemId)) });
      invalidateParentQueries(queryClient, variables).catch((e) => handleResponseErrors(e));
      // Optimistic outline-index cache update: remove deleted item from the tree
      const itemId = variables.itemId;
      const category = getBlockType(itemId);
      if (courseId && ['chapter', 'sequential', 'vertical'].includes(category)) {
        queryClient.setQueryData(
          courseOutlineIndexQueryKey(courseId),
          (old: any) => removeItemFromOutlineIndexData(old, itemId, variables),
        );
      }
    },
  });
};

export const useConfigureSection = (courseId?: string) => {
  const queryClient = useQueryClient();
  return useMutationWithProcessingNotification({
    mutationKey: courseOutlineMutationKeys.savingOperation(courseId, 'configureSection'),
    mutationFn: (variables: ConfigureSectionData & ParentIds) => configureCourseSection(variables),
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: courseOutlineQueryKeys.courseDetails(getCourseKey(variables.sectionId)),
      });
      invalidateParentQueries(queryClient, variables).catch((e) => handleResponseErrors(e));
    },
  });
};

export const useConfigureSubsection = (courseId?: string) => {
  const queryClient = useQueryClient();
  return useMutationWithProcessingNotification({
    mutationKey: courseOutlineMutationKeys.savingOperation(courseId, 'configureSubsection'),
    mutationFn: (
      variables: Partial<ConfigureSubsectionData> & Pick<ConfigureSubsectionData, 'itemId'> & ParentIds,
    ) => configureCourseSubsection(variables),
    onSettled: async (_data, _err, variables) => {
      const courseKey = getCourseKey(variables.itemId);
      queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.courseDetails(courseKey) });
      invalidateParentQueries(queryClient, variables).catch((e) => handleResponseErrors(e));
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
    mutationKey: courseOutlineMutationKeys.savingOperation(courseId, 'configureUnit'),
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

export const useUpdateCourseSectionHighlights = (courseId?: string) => {
  const queryClient = useQueryClient();
  return useMutationWithProcessingNotification({
    mutationKey: courseOutlineMutationKeys.savingOperation(courseId, 'highlights'),
    mutationFn: (
      variables: {
        sectionId: string;
        highlights: string[];
      } & ParentIds,
    ) => updateCourseSectionHighlights(variables.sectionId, variables.highlights),
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
  const { setData } = useScrollState(courseKey);
  return useMutationWithProcessingNotification({
    mutationKey: courseOutlineMutationKeys.savingOperation(courseKey, 'duplicate'),
    mutationFn: (
      variables: {
        itemId: string;
        parentId: string;
      } & ParentIds,
    ) => duplicateCourseItem(variables.itemId, variables.parentId),
    onSuccess: async (data, variables) => {
      await invalidateParentQueries(queryClient, variables).catch((e) => handleResponseErrors(e));

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
    mutationKey: courseOutlineMutationKeys.savingOperation(courseId, 'reorderUnits'),
    mutationFn: (variables: {
      sectionId: string;
      prevSectionId?: string;
      subsectionId: string;
      unitListIds: string[];
    }) => setCourseItemOrderList(variables.subsectionId, variables.unitListIds),
  });
};

export const useReorderSections = (courseId: string) => {
  return useMutationWithProcessingNotification({
    mutationKey: courseOutlineMutationKeys.savingOperation(courseId, 'reorderSections'),
    mutationFn: (sectionListIds: string[]) => setSectionOrderList(courseId, sectionListIds),
  });
};

export const useReorderSubsections = (courseId?: string) => {
  return useMutationWithProcessingNotification({
    mutationKey: courseOutlineMutationKeys.savingOperation(courseId, 'reorderSubsections'),
    mutationFn: (variables: {
      sectionId: string;
      prevSectionId?: string;
      subsectionListIds: string[];
    }) => setCourseItemOrderList(variables.sectionId, variables.subsectionListIds),
  });
};

export const usePasteItem = (courseId?: string) => {
  const queryClient = useQueryClient();
  const { setData: setScrollState } = useScrollState(courseId);
  const { setData } = usePasteFileNotices(courseId);
  return useMutationWithProcessingNotification({
    mutationKey: courseOutlineMutationKeys.savingOperation(courseId, 'paste'),
    mutationFn: (
      variables: {
        parentLocator: string;
      } & ParentIds,
    ) => pasteBlock(variables.parentLocator),
    onSuccess: async (data, variables) => {
      await invalidateParentQueries(queryClient, variables).catch((e) => handleResponseErrors(e));
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
    mutationKey: courseOutlineMutationKeys.savingOperation(courseId, 'videoSharing'),
    mutationFn: (value: string) => setVideoSharingOption(courseId, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseOutlineIndexQueryKey(courseId) });
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
    mutationKey: courseOutlineMutationKeys.savingOperation(courseId, 'highlightsEmail'),
    mutationFn: () => enableCourseHighlightsEmails(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseOutlineIndexQueryKey(courseId) });
    },
  });
}

/**
 * Dismiss a notification for a course.
 * Uses bare useMutation (no processing toast) to match existing behavior.
 */
export function useDismissNotification(courseId: string) {
  return useMutation({
    mutationKey: courseOutlineMutationKeys.savingOperation(courseId, 'dismissNotification'),
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
export function useRestartIndexingOnCourse(courseId: string) {
  return useMutation({
    mutationKey: courseOutlineMutationKeys.reindex(courseId),
    mutationFn: (reindexLink: string) => restartIndexingOnCourse(reindexLink),
  });
}

/**
 * Aggregate save status across all saving mutations for a course.
 * Priority: pending > latest completed by submittedAt > idle => ''
 */
export function useCourseOutlineSavingStatus(courseId?: string): string {
  const mutations = useMutationState({
    filters: { mutationKey: courseOutlineMutationKeys.saving(courseId) },
  });
  // Pending wins
  const hasPending = mutations.some(m => m.status === 'pending');
  if (hasPending) { return RequestStatus.PENDING; }
  // Find latest by submittedAt among completed
  let latest: { status: 'success' | 'error'; submittedAt: number; } | null = null;
  for (const m of mutations) {
    if (m.status !== 'success' && m.status !== 'error') { continue; }
    const t = m.submittedAt ?? 0;
    if (t > 0 && (!latest || t > latest.submittedAt)) {
      latest = { status: m.status as 'success' | 'error', submittedAt: t };
    }
  }
  if (!latest) { return ''; }
  return latest.status === 'error' ? RequestStatus.FAILED : RequestStatus.SUCCESSFUL;
}

/**
 * Find the most recent (by submittedAt) mutation among a list.
 */
function latestMutation<T extends { submittedAt?: number; status?: string; }>(mutations: T[]): T | undefined {
  let latest: T | undefined;
  for (const m of mutations) {
    if (m.status !== 'success' && m.status !== 'error' && m.status !== 'pending') { continue; }
    const t = m.submittedAt ?? 0;
    if (t > 0 && (!latest || (latest.submittedAt ?? 0) < t)) {
      latest = m;
    }
  }
  return latest;
}

/**
 * Derive reindex loading status and error from reindex mutations.
 */
export function useCourseOutlineReindexStatus(courseId?: string): {
  reindexLoadingStatus: string;
  reindexError: any;
} {
  const mutations = useMutationState({
    filters: { mutationKey: courseOutlineMutationKeys.reindex(courseId) },
  });
  const latest = latestMutation(mutations);
  const status = latest?.status;
  if (status === 'pending') {
    return { reindexLoadingStatus: RequestStatus.IN_PROGRESS, reindexError: null };
  }
  if (status === 'error' && latest) {
    return {
      reindexLoadingStatus: RequestStatus.FAILED,
      reindexError: getErrorDetails(latest.error),
    };
  }
  if (status === 'success') {
    return { reindexLoadingStatus: RequestStatus.SUCCESSFUL, reindexError: null };
  }
  // idle / no mutations — preserve existing behavior (IN_PROGRESS)
  return { reindexLoadingStatus: RequestStatus.IN_PROGRESS, reindexError: null };
}
