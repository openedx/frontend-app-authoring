import { useCallback } from 'react';
import {
  useCourseOutlineContext,
} from '../CourseOutlineContext';
import { useOutlineDeleteAction } from './useOutlineActions';

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
  const { handleDeleteItemSubmit } = useOutlineDeleteAction(courseId);

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
