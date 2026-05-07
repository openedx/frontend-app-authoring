import {
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useToggle } from '@openedx/paragon';

import { SelectionState } from '@src/data/types';
import { useToggleWithValue } from '@src/hooks';
import { useCourseAuthoringContext, type ModalState } from '@src/CourseAuthoringContext';
import {
  useCreateCourseBlock,
} from './data/apiHooks';

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
  const { courseId, openUnitPage } = useCourseAuthoringContext();
  const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useToggle(false);
  const [
    isPublishModalOpen,
    currentPublishModalData,
    openPublishModal,
    closePublishModal,
  ] = useToggleWithValue<ModalState>();

  /**
   * Holds action target state for menus, edit, duplicate, delete, and modals.
   * This is intentionally separate from sidebar/card selection so opening a menu
   * does not change which card is selected in the outline.
   */
  const [currentSelection, setCurrentSelection] = useState<SelectionState | undefined>();

  const handleAddAndOpenUnit = useCreateCourseBlock(courseId, openUnitPage);
  const handleAddBlock = useCreateCourseBlock(courseId);

  const context = useMemo<CourseOutlineContextData>(() => ({
    handleAddBlock,
    handleAddAndOpenUnit,
    currentSelection,
    setCurrentSelection,
    isDeleteModalOpen,
    openDeleteModal,
    closeDeleteModal,
    isPublishModalOpen,
    currentPublishModalData,
    openPublishModal,
    closePublishModal,
  }), [
    handleAddBlock,
    handleAddAndOpenUnit,
    currentSelection,
    setCurrentSelection,
    isDeleteModalOpen,
    openDeleteModal,
    closeDeleteModal,
    isPublishModalOpen,
    currentPublishModalData,
    openPublishModal,
    closePublishModal,
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
