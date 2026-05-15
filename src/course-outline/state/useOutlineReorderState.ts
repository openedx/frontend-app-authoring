import { useCallback, useRef, useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { useQueryClient } from '@tanstack/react-query';

import type { XBlock } from '@src/data/types';
import {
  replaceSectionInOutlineIndex,
  useReorderSections,
  useReorderSubsections,
  useReorderUnits,
} from '../data/apiHooks';
import { getCourseItem } from '../data/api';
import { courseOutlineIndexQueryKey } from '../data/outlineIndexQuery';

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
  updateSectionOrderByIndex: (currentIndex: number, newIndex: number) => Promise<void>;
  updateSubsectionOrderByIndex: (section: XBlock, moveDetails: any) => Promise<void>;
  updateUnitOrderByIndex: (section: XBlock, moveDetails: any) => Promise<void>;
}

export function useOutlineReorderState({
  courseId,
  sections,
}: UseOutlineReorderStateInput): UseOutlineReorderStateOutput {
  const queryClient = useQueryClient();

  // --- Preview state for drag reorder ---
  const [previewSectionsState, setPreviewSectionsState] = useState<XBlock[] | undefined>();
  const visibleSections = previewSectionsState ?? sections;

  // Always keep a ref pointing at the latest visible tree so callbacks
  // can sync it to the query cache without stale closures.
  const latestVisibleSectionsRef = useRef<XBlock[]>(visibleSections);
  latestVisibleSectionsRef.current = visibleSections;

  const rollbackReorderPreview = useCallback(() => {
    setPreviewSectionsState(undefined);
  }, []);

  const acceptReorderPreview = useCallback(() => {
    setPreviewSectionsState(undefined);
  }, []);

  // Write the current visible tree (preview or committed) into the outline
  // index query cache so the next consumer gets up-to-date children without
  // an extra network round-trip.
  const syncPreviewTreeToCache = useCallback(() => {
    const tree = latestVisibleSectionsRef.current;
    queryClient.setQueryData(courseOutlineIndexQueryKey(courseId), (old: any) => {
      if (!old?.courseStructure?.childInfo) { return old; }
      return {
        ...old,
        courseStructure: {
          ...old.courseStructure,
          childInfo: {
            ...old.courseStructure.childInfo,
            children: tree,
          },
        },
      };
    });
  }, [queryClient, courseId]);

  // Accept reorder preview then sync React Query cache with new section order
  const acceptReorderAndSyncSectionOrder = useCallback((sectionListIds: string[]) => {
    acceptReorderPreview();
    queryClient.setQueryData(courseOutlineIndexQueryKey(courseId), (old: any) => {
      if (!old?.courseStructure?.childInfo?.children) { return old; }
      return {
        ...old,
        courseStructure: {
          ...old.courseStructure,
          childInfo: {
            ...old.courseStructure.childInfo,
            children: sectionListIds.map(id => old.courseStructure.childInfo.children.find((s: any) => s.id === id))
              .filter(Boolean),
          },
        },
      };
    });
  }, [acceptReorderPreview, queryClient, courseId]);

  const cancelReorderPreview = useCallback(() => {
    setPreviewSectionsState(undefined);
  }, []);

  const callPreviewSections = useCallback((nextSections: XBlock[]) => {
    latestVisibleSectionsRef.current = nextSections;
    setPreviewSectionsState(nextSections);
  }, []);

  // Refetch affected sections after subsection/unit reorder so publish status
  // (published, hasChanges) is fresh rather than stale from the cache.
  // Bound to max 2 requests — target section + source section if cross-section move.
  // Falls back to broad invalidation if refetch merge cannot apply.
  const refetchAffectedSections = useCallback(async (
    targetSectionId: string,
    sourceSectionId?: string,
  ) => {
    const sectionIds: string[] = [targetSectionId];
    if (sourceSectionId && sourceSectionId !== targetSectionId) {
      sectionIds.push(sourceSectionId);
    }
    const freshSections: Record<string, XBlock> = {};
    await Promise.all(sectionIds.map(async (id) => {
      try {
        const sectionData = await getCourseItem<XBlock>(id);
        freshSections[id] = sectionData;
      } catch {
        // If one section fetch fails, still try the others
      }
    }));
    if (Object.keys(freshSections).length > 0) {
      replaceSectionInOutlineIndex(queryClient, courseId, freshSections);
    } else {
      queryClient.invalidateQueries({ queryKey: courseOutlineIndexQueryKey(courseId) });
    }
  }, [queryClient, courseId]);

  // --- Reorder mutation hooks ---
  const reorderSectionsMutation = useReorderSections(courseId);
  const reorderSubsectionsMutation = useReorderSubsections();
  const reorderUnitsMutation = useReorderUnits();

  const commitSectionReorder = useCallback(async (sectionListIds: string[]) => {
    if (!courseId) {
      return;
    }
    try {
      await reorderSectionsMutation.mutateAsync(sectionListIds);
      acceptReorderAndSyncSectionOrder(sectionListIds);
    } catch {
      rollbackReorderPreview();
    }
  }, [courseId, reorderSectionsMutation, acceptReorderAndSyncSectionOrder, rollbackReorderPreview]);

  const commitSubsectionReorder = useCallback(async (
    sectionId: string,
    prevSectionId: string,
    subsectionListIds: string[],
  ) => {
    try {
      await reorderSubsectionsMutation.mutateAsync({ sectionId, prevSectionId, subsectionListIds });
      // Sync the preview tree (already contains the reorder) into cache.
      syncPreviewTreeToCache();
      acceptReorderPreview();
      // Refetch affected sections for fresh publish status.
      await refetchAffectedSections(sectionId, prevSectionId);
    } catch {
      rollbackReorderPreview();
    }
  }, [
    reorderSubsectionsMutation,
    syncPreviewTreeToCache,
    acceptReorderPreview,
    rollbackReorderPreview,
    refetchAffectedSections,
  ]);

  const commitUnitReorder = useCallback(async (
    sectionId: string,
    prevSectionId: string,
    subsectionId: string,
    unitListIds: string[],
  ) => {
    try {
      await reorderUnitsMutation.mutateAsync({ sectionId, prevSectionId, subsectionId, unitListIds });
      // Sync the preview tree (already contains the reorder) into cache.
      syncPreviewTreeToCache();
      acceptReorderPreview();
      // Refetch affected sections for fresh publish status.
      await refetchAffectedSections(sectionId, prevSectionId);
    } catch {
      rollbackReorderPreview();
    }
  }, [
    reorderUnitsMutation,
    syncPreviewTreeToCache,
    acceptReorderPreview,
    rollbackReorderPreview,
    refetchAffectedSections,
  ]);

  const updateSectionOrderByIndex = useCallback(async (currentIndex: number, newIndex: number) => {
    if (!courseId || currentIndex === newIndex) {
      return;
    }

    const nextSections = arrayMove(visibleSections, currentIndex, newIndex) as XBlock[];
    const sectionListIds = nextSections.map((section) => section.id);
    latestVisibleSectionsRef.current = nextSections;
    setPreviewSectionsState(nextSections);

    try {
      await reorderSectionsMutation.mutateAsync(sectionListIds);
      acceptReorderAndSyncSectionOrder(sectionListIds);
    } catch {
      rollbackReorderPreview();
    }
  }, [visibleSections, courseId, reorderSectionsMutation, rollbackReorderPreview, acceptReorderAndSyncSectionOrder]);

  const updateSubsectionOrderByIndex = useCallback(async (section: XBlock, moveDetails) => {
    const { fn, args, sectionId } = moveDetails;
    if (!args) {
      return;
    }

    const [sectionsCopy, newSubsections] = fn(...args);
    if (newSubsections && sectionId) {
      latestVisibleSectionsRef.current = sectionsCopy;
      setPreviewSectionsState(sectionsCopy);
      try {
        await reorderSubsectionsMutation.mutateAsync({
          sectionId,
          prevSectionId: section.id,
          subsectionListIds: newSubsections.map((subsection: XBlock) => subsection.id),
        });
        syncPreviewTreeToCache();
        acceptReorderPreview();
        // Refetch affected sections for fresh publish status.
        await refetchAffectedSections(sectionId, section.id);
      } catch {
        rollbackReorderPreview();
      }
    }
  }, [
    visibleSections,
    reorderSubsectionsMutation,
    syncPreviewTreeToCache,
    rollbackReorderPreview,
    acceptReorderPreview,
    refetchAffectedSections,
  ]);

  const updateUnitOrderByIndex = useCallback(async (section: XBlock, moveDetails) => {
    const { fn, args, sectionId, subsectionId } = moveDetails;
    if (!args) {
      return;
    }

    const [sectionsCopy, newUnits] = fn(...args);
    if (newUnits && subsectionId) {
      latestVisibleSectionsRef.current = sectionsCopy;
      setPreviewSectionsState(sectionsCopy);
      try {
        await reorderUnitsMutation.mutateAsync({
          sectionId,
          prevSectionId: section.id,
          subsectionId,
          unitListIds: newUnits.map((unit: XBlock) => unit.id),
        });
        syncPreviewTreeToCache();
        acceptReorderPreview();
        // Refetch affected sections for fresh publish status.
        await refetchAffectedSections(sectionId, section.id);
      } catch {
        rollbackReorderPreview();
      }
    }
  }, [
    visibleSections,
    reorderUnitsMutation,
    syncPreviewTreeToCache,
    rollbackReorderPreview,
    acceptReorderPreview,
    refetchAffectedSections,
  ]);

  return {
    visibleSections,
    previewSections: callPreviewSections,
    cancelReorderPreview,
    commitSectionReorder,
    commitSubsectionReorder,
    commitUnitReorder,
    updateSectionOrderByIndex,
    updateSubsectionOrderByIndex,
    updateUnitOrderByIndex,
  };
}
