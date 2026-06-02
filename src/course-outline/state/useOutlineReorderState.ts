import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import type { XBlock } from '@src/data/types';
import {
  replaceSectionInOutlineIndex,
  useReorderSections,
  useReorderSubsections,
  useReorderUnits,
  getCourseItem,
  courseOutlineIndexQueryKey,
} from '../data';

interface UseOutlineReorderStateInput {
  courseId: string;
  sections: XBlock[];
}

export interface UseOutlineReorderStateOutput {
  visibleSections: XBlock[];
  previewSections: (nextSections: XBlock[]) => void;
  cancelReorderPreview: () => void;
  commitSectionReorder: (sectionListIds: string[]) => Promise<void>;
  commitSubsectionReorder: (sectionId: string, prevSectionId: string, subsectionListIds: string[]) => Promise<void>;
  commitUnitReorder: (
    sectionId: string,
    prevSectionId: string,
    subsectionId: string,
    unitListIds: string[],
  ) => Promise<void>;
}

export function useOutlineReorderState({
  courseId,
  sections,
}: UseOutlineReorderStateInput): UseOutlineReorderStateOutput {
  const queryClient = useQueryClient();

  // --- Preview state for drag reorder ---
  const [previewSectionsState, setPreviewSectionsState] = useState<XBlock[] | undefined>();
  const visibleSections = previewSectionsState ?? sections;

  const clearPreview = useCallback(() => {
    setPreviewSectionsState(undefined);
  }, []);

  // Accept reorder preview then sync React Query cache with new section order.
  // If any section id is missing from the current cache (e.g. concurrent change),
  // invalidate instead of writing a shorter list to avoid silent data loss.
  const acceptReorderAndSyncSectionOrder = useCallback((sectionListIds: string[]) => {
    clearPreview();
    // Use setQueryData updater form so the cache read is atomic with the write.
    // This avoids a stale-read race if another mutation updates the cache
    // concurrently between reading and writing.
    // The updater is kept pure: side-effect flags drive an outer invalidation
    // call after setQueryData returns.
    let shouldInvalidate = false;
    queryClient.setQueryData(courseOutlineIndexQueryKey(courseId), (old: any) => {
      if (!old?.courseStructure?.childInfo?.children) { return old; }
      const matchedSections = sectionListIds.map(
        id => old.courseStructure.childInfo.children.find((s: any) => s.id === id),
      );
      if (matchedSections.some(s => s === undefined)) {
        // At least one id not found in cache — concurrent edit likely.
        // Set flag so caller invalidates after setQueryData returns.
        // Return old unchanged rather than writing a shorter list.
        shouldInvalidate = true;
        return old;
      }
      return {
        ...old,
        courseStructure: {
          ...old.courseStructure,
          childInfo: {
            ...old.courseStructure.childInfo,
            children: matchedSections,
          },
        },
      };
    });
    if (shouldInvalidate) {
      queryClient.invalidateQueries({ queryKey: courseOutlineIndexQueryKey(courseId) });
    }
  }, [clearPreview, queryClient, courseId]);

  const cancelReorderPreview = clearPreview;

  const callPreviewSections = useCallback((nextSections: XBlock[]) => {
    setPreviewSectionsState(nextSections);
  }, []);

  // Refetch affected sections after subsection/unit reorder so publish status
  // (published, hasChanges) is fresh rather than stale from the cache.
  // Bound to max 2 requests — target section + source section if cross-section move.
  // If any individual fetch fails, we still apply the ones that succeeded but also
  // invalidate so the stale cache entry gets reconciled on next read.
  const refetchAffectedSections = useCallback(async (
    targetSectionId: string,
    sourceSectionId?: string,
  ) => {
    const sectionIds: string[] = [targetSectionId];
    if (sourceSectionId && sourceSectionId !== targetSectionId) {
      sectionIds.push(sourceSectionId);
    }
    let anyFailed = false;
    const freshSections: Record<string, XBlock> = {};
    await Promise.all(sectionIds.map(async (id) => {
      try {
        const sectionData = await getCourseItem<XBlock>(id);
        freshSections[id] = sectionData;
      } catch {
        anyFailed = true;
      }
    }));
    if (Object.keys(freshSections).length > 0) {
      replaceSectionInOutlineIndex(queryClient, courseId, freshSections);
    }
    if (anyFailed || Object.keys(freshSections).length === 0) {
      queryClient.invalidateQueries({ queryKey: courseOutlineIndexQueryKey(courseId) });
    }
  }, [queryClient, courseId]);

  // --- Reorder mutation hooks ---
  const reorderSectionsMutation = useReorderSections(courseId);
  const reorderSubsectionsMutation = useReorderSubsections(courseId);
  const reorderUnitsMutation = useReorderUnits(courseId);

  // ─── Shared helpers: own mutation + success callback + error catch ─────────

  const runSectionReorder = useCallback(async (sectionListIds: string[]) => {
    try {
      await reorderSectionsMutation.mutateAsync(sectionListIds);
      acceptReorderAndSyncSectionOrder(sectionListIds);
    } catch {
      clearPreview();
    }
  }, [reorderSectionsMutation, acceptReorderAndSyncSectionOrder, clearPreview]);

  // Shared post-success for subsection/unit reorder: clear preview, refetch fresh data.
  const finishSubtreeReorder = useCallback(async (
    sectionId: string,
    prevSectionId: string,
  ) => {
    clearPreview();
    await refetchAffectedSections(sectionId, prevSectionId);
  }, [clearPreview, refetchAffectedSections]);

  const runSubsectionReorder = useCallback(async (
    sectionId: string,
    prevSectionId: string,
    subsectionListIds: string[],
  ) => {
    try {
      await reorderSubsectionsMutation.mutateAsync({ sectionId, subsectionListIds });
      await finishSubtreeReorder(sectionId, prevSectionId);
    } catch {
      clearPreview();
    }
  }, [reorderSubsectionsMutation, finishSubtreeReorder, clearPreview]);

  const runUnitReorder = useCallback(async (
    sectionId: string,
    prevSectionId: string,
    subsectionId: string,
    unitListIds: string[],
  ) => {
    try {
      await reorderUnitsMutation.mutateAsync({ sectionId, subsectionId, unitListIds });
      await finishSubtreeReorder(sectionId, prevSectionId);
    } catch {
      clearPreview();
    }
  }, [reorderUnitsMutation, finishSubtreeReorder, clearPreview]);

  // ─── Public API: guard + compute preview + delegate ───────────────────────

  const commitSectionReorder = useCallback(async (sectionListIds: string[]) => {
    if (!courseId) { return; }
    await runSectionReorder(sectionListIds);
  }, [courseId, runSectionReorder]);

  const commitSubsectionReorder = useCallback(async (
    sectionId: string,
    prevSectionId: string,
    subsectionListIds: string[],
  ) => {
    await runSubsectionReorder(sectionId, prevSectionId, subsectionListIds);
  }, [runSubsectionReorder]);

  const commitUnitReorder = useCallback(async (
    sectionId: string,
    prevSectionId: string,
    subsectionId: string,
    unitListIds: string[],
  ) => {
    await runUnitReorder(sectionId, prevSectionId, subsectionId, unitListIds);
  }, [runUnitReorder]);

  return {
    visibleSections,
    previewSections: callPreviewSections,
    cancelReorderPreview,
    commitSectionReorder,
    commitSubsectionReorder,
    commitUnitReorder,
  };
}
