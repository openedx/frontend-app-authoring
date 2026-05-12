/**
 * Compatibility shim — re-exports from CourseOutlineStateContext with
 * API mapping for old `currentSelection` / `setCurrentSelection` names.
 *
 * Direct-path imports from this file continue to work but resolve to
 * the single seam in CourseOutlineStateContext.
 */

import { type SelectionState } from '@src/data/types';
import type { ModalState } from '@src/CourseAuthoringContext';
import {
  useCreateCourseBlock,
} from './data/apiHooks';
import { useCourseOutlineContext as useUnderlying } from './CourseOutlineStateContext';

export { CourseOutlineProvider } from './CourseOutlineStateContext';

/**
 * Shim hook — maps old API names to the renamed state context fields.
 *
 * Callers using this shim get:
 *   currentSelection  ←  actionTargetSelection
 *   setCurrentSelection  ←  setActionTargetSelection
 *
 * All other fields pass through with identical names.
 */
export const useCourseOutlineContext = () => {
  const ctx = useUnderlying();
  const {
    actionTargetSelection,
    setActionTargetSelection,
    ...rest
  } = ctx;
  return {
    ...rest,
    currentSelection: actionTargetSelection,
    setCurrentSelection: setActionTargetSelection,
  };
};

// Legacy type — same shape callers expect.
export type CourseOutlineContextData = {
  handleAddAndOpenUnit: ReturnType<typeof useCreateCourseBlock>;
  handleAddBlock: ReturnType<typeof useCreateCourseBlock>;
  currentSelection?: SelectionState;
  setCurrentSelection: React.Dispatch<React.SetStateAction<SelectionState | undefined>>;
  isDeleteModalOpen: boolean;
  openDeleteModal: () => void;
  closeDeleteModal: () => void;
  isPublishModalOpen: boolean;
  currentPublishModalData?: ModalState;
  openPublishModal: (value: ModalState) => void;
  closePublishModal: () => void;
};
