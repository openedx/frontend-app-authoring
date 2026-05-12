import {
  createContext,
  useContext,
  useMemo,
} from 'react';

import { SelectionState } from '@src/data/types';
import type { ModalState } from '@src/CourseAuthoringContext';
import {
  useCreateCourseBlock,
} from './data/apiHooks';
import { useCourseOutlineState } from './CourseOutlineStateContext';

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

/**
 * Course Outline Context.
 * Only available within the course outline page.
 *
 * Get this using `useCourseOutlineContext()`
 */
const CourseOutlineContext = createContext<CourseOutlineContextData | undefined>(undefined);

type CourseOutlineProviderProps = {
  children?: React.ReactNode;
};

export const CourseOutlineProvider = ({ children }: CourseOutlineProviderProps) => {
  const state = useCourseOutlineState();

  const context = useMemo<CourseOutlineContextData>(() => ({
    handleAddBlock: state.handleAddBlock,
    handleAddAndOpenUnit: state.handleAddAndOpenUnit,
    currentSelection: state.actionTargetSelection,
    setCurrentSelection: state.setActionTargetSelection,
    isDeleteModalOpen: state.isDeleteModalOpen,
    openDeleteModal: state.openDeleteModal,
    closeDeleteModal: state.closeDeleteModal,
    isPublishModalOpen: state.isPublishModalOpen,
    currentPublishModalData: state.currentPublishModalData,
    openPublishModal: state.openPublishModal,
    closePublishModal: state.closePublishModal,
  }), [
    state.handleAddBlock,
    state.handleAddAndOpenUnit,
    state.actionTargetSelection,
    state.setActionTargetSelection,
    state.isDeleteModalOpen,
    state.openDeleteModal,
    state.closeDeleteModal,
    state.isPublishModalOpen,
    state.currentPublishModalData,
    state.openPublishModal,
    state.closePublishModal,
  ]);

  return (
    <CourseOutlineContext.Provider value={context}>
      {children}
    </CourseOutlineContext.Provider>
  );
};

export function useCourseOutlineContext(): CourseOutlineContextData {
  const ctx = useContext(CourseOutlineContext);
  if (ctx === undefined) {
    /* istanbul ignore next */
    throw new Error('useCourseOutlineContext() was used in a component without a <CourseOutlineProvider> ancestor.');
  }
  return ctx;
}
