import { useCallback } from 'react';
import type { OutlineActionSelection } from '@src/data/types';
import {
  useCourseOutlineContext,
} from '../CourseOutlineContext';
import { useDeleteCourseItem } from '../data';
import { OUTLINE_CATEGORY_CONFIG } from '../constants';

export interface UseDeleteModalOutput {
  onDeleteConfirm: () => Promise<void>;
}

/**
 * Delete confirmation modal hook.
 * Coordinates delete submission with modal close and selection clear.
 */
export function useDeleteModal(courseId: string): UseDeleteModalOutput {
  const {
    deleteModalData,
    closeDeleteModal,
    currentSelection,
    clearSelection,
  } = useCourseOutlineContext();
  const deleteMutation = useDeleteCourseItem(courseId);

  const handleDeleteItemSubmit = useCallback(
    async (selection: OutlineActionSelection): Promise<boolean> => {
      try {
        const config = OUTLINE_CATEGORY_CONFIG[selection.category];
        const deleteParams: Record<string, string> = { itemId: selection.currentId };
        for (const field of config.deleteExtraFields) {
          deleteParams[field] = (selection as any)[field];
        }
        await deleteMutation.mutateAsync(deleteParams as Parameters<typeof deleteMutation.mutateAsync>[0]);
        return true;
      } catch {
        return false;
      }
    },
    [deleteMutation],
  );

  const onDeleteConfirm = useCallback(async () => {
    if (!deleteModalData) { return; }
    const success = await handleDeleteItemSubmit(deleteModalData);
    if (success) {
      closeDeleteModal();
      if (currentSelection?.currentId === deleteModalData.currentId) {
        clearSelection();
      }
    }
  }, [deleteModalData, handleDeleteItemSubmit, closeDeleteModal, currentSelection, clearSelection]);

  return { onDeleteConfirm };
}
