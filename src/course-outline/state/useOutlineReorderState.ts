import { useCallback, useRef, useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { useQueryClient } from '@tanstack/react-query';

import type { XBlock } from '@src/data/types';
import {
  useReorderSections,
  useReorderSubsections,
  useReorderUnits,
} from '../data/apiHooks';
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
  commitUnitReorder: (sectionId: string, prevSectionId: string, subsectionId: string, unitListIds: string[]) => Promise<void>;
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
  const previousSectionsRef = useRef<XBlock[] | undefined>();

  const visibleSections = previewSectionsState ?? sections;

  const captureOriginalSections = useCallback(() => {
    if (!previousSectionsRef.current) {
      previousSectionsRef.current = visibleSections;
    }
  }, [visibleSections]);

  const rollbackReorderPreview = useCallback(() => {
    setPreviewSectionsState(undefined);
    previousSectionsRef.current = undefined;
  }, []);

  const acceptReorderPreview = useCallback(() => {
    setPreviewSectionsState(undefined);
    previousSectionsRef.current = undefined;
  }, []);

  // Accept reorder preview then sync React Query cache with new section order
  const acceptReorderAndSyncSectionOrder = useCallback((sectionListIds: string[]) => {
    acceptReorderPreview();
    queryClient.setQueryData(courseOutlineIndexQueryKey(courseId), (old: any) => {
      if (!old?.courseStructure?.childInfo?.children) return old;
      return {
        ...old,
        courseStructure: {
          ...old.courseStructure,
          childInfo: {
            ...old.courseStructure.childInfo,
            children: sectionListIds.map(id =>
              old.courseStructure.childInfo.children.find((s: any) => s.id === id)
            ).filter(Boolean),
          },
        },
      };
    });
  }, [acceptReorderPreview, queryClient, courseId]);

  const cancelReorderPreview = useCallback(() => {
    setPreviewSectionsState(undefined);
    previousSectionsRef.current = undefined;
  }, []);

  const callPreviewSections = useCallback((nextSections: XBlock[]) => {
    captureOriginalSections();
    setPreviewSectionsState(nextSections);
  }, [captureOriginalSections]);

  // --- Reorder mutation hooks ---
  const reorderSectionsMutation = useReorderSections(courseId);
  const reorderSubsectionsMutation = useReorderSubsections(courseId);
  const reorderUnitsMutation = useReorderUnits(courseId);

  const commitSectionReorder = useCallback(async (sectionListIds: string[]) => {
    if (!courseId) {
      return;
    }
    captureOriginalSections();
    try {
      await reorderSectionsMutation.mutateAsync(sectionListIds);
      acceptReorderAndSyncSectionOrder(sectionListIds);
    } catch {
      rollbackReorderPreview();
    }
  }, [courseId, reorderSectionsMutation, captureOriginalSections, acceptReorderAndSyncSectionOrder, rollbackReorderPreview]);

  const commitSubsectionReorder = useCallback(async (
    sectionId: string,
    prevSectionId: string,
    subsectionListIds: string[],
  ) => {
    captureOriginalSections();
    try {
      await reorderSubsectionsMutation.mutateAsync({ sectionId, prevSectionId, subsectionListIds });
      acceptReorderPreview();
    } catch {
      rollbackReorderPreview();
    }
  }, [reorderSubsectionsMutation, captureOriginalSections, acceptReorderPreview, rollbackReorderPreview]);

  const commitUnitReorder = useCallback(async (
    sectionId: string,
    prevSectionId: string,
    subsectionId: string,
    unitListIds: string[],
  ) => {
    captureOriginalSections();
    try {
      await reorderUnitsMutation.mutateAsync({ sectionId, prevSectionId, subsectionId, unitListIds });
      acceptReorderPreview();
    } catch {
      rollbackReorderPreview();
    }
  }, [reorderUnitsMutation, captureOriginalSections, acceptReorderPreview, rollbackReorderPreview]);

  const updateSectionOrderByIndex = useCallback(async (currentIndex: number, newIndex: number) => {
    if (!courseId || currentIndex === newIndex) {
      return;
    }

    previousSectionsRef.current = visibleSections;
    const nextSections = arrayMove(visibleSections, currentIndex, newIndex) as XBlock[];
    const sectionListIds = nextSections.map((section) => section.id);
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

    previousSectionsRef.current = visibleSections;
    const [sectionsCopy, newSubsections] = fn(...args);
    if (newSubsections && sectionId) {
      setPreviewSectionsState(sectionsCopy);
      try {
        await reorderSubsectionsMutation.mutateAsync({
          sectionId,
          prevSectionId: section.id,
          subsectionListIds: newSubsections.map((subsection: XBlock) => subsection.id),
        });
        acceptReorderPreview();
      } catch {
        rollbackReorderPreview();
      }
    }
  }, [visibleSections, reorderSubsectionsMutation, rollbackReorderPreview, acceptReorderPreview]);

  const updateUnitOrderByIndex = useCallback(async (section: XBlock, moveDetails) => {
    const { fn, args, sectionId, subsectionId } = moveDetails;
    if (!args) {
      return;
    }

    previousSectionsRef.current = visibleSections;
    const [sectionsCopy, newUnits] = fn(...args);
    if (newUnits && subsectionId) {
      setPreviewSectionsState(sectionsCopy);
      try {
        await reorderUnitsMutation.mutateAsync({
          sectionId,
          prevSectionId: section.id,
          subsectionId,
          unitListIds: newUnits.map((unit: XBlock) => unit.id),
        });
        acceptReorderPreview();
      } catch {
        rollbackReorderPreview();
      }
    }
  }, [visibleSections, reorderUnitsMutation, rollbackReorderPreview, acceptReorderPreview]);

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
