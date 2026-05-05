import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToggle } from '@openedx/paragon';

import { SelectionState } from '@src/data/types';
import { useToggleWithValue } from '@src/hooks';
import { getBlockType } from '@src/generic/key-utils';
import { COURSE_BLOCK_NAMES } from '@src/constants';
import { useCourseAuthoringContext, type ModalState } from '@src/CourseAuthoringContext';
import {
  useCreateCourseBlock,
  useDeleteCourseItem,
  useDuplicateItem,
} from './data/apiHooks';
import { getOutlineIndexData } from './data/selectors';
import {
  deleteSection,
  deleteSubsection,
  deleteUnit,
  fetchOutlineIndexSuccess,
  updateCourseActions,
  updateOutlineIndexLoadingStatus,
  updateStatusBar,
} from './data/slice';
import {
  getCourseOutlineIndexRequestState,
  getCourseOutlineStatusBarData,
  useCourseOutlineIndex,
} from './data/outlineIndexQuery';

export type CourseOutlineContextData = {
  handleAddAndOpenUnit: ReturnType<typeof useCreateCourseBlock>;
  handleAddBlock: ReturnType<typeof useCreateCourseBlock>;
  currentSelection?: SelectionState;
  setCurrentSelection: React.Dispatch<React.SetStateAction<SelectionState | undefined>>;
  isDuplicatingItem: boolean;
  isDeleteModalOpen: boolean;
  openDeleteModal: () => void;
  closeDeleteModal: () => void;
  getHandleDeleteItemSubmit: (callback: () => void) => () => Promise<void>;
  handleDuplicateSectionSubmit: () => void;
  handleDuplicateSubsectionSubmit: () => void;
  handleDuplicateUnitSubmit: () => void;
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
  const dispatch = useDispatch();
  const outlineIndexData = useSelector(getOutlineIndexData);
  const { courseStructure } = outlineIndexData;
  const outlineIndexQuery = useCourseOutlineIndex(courseId, {
    initialData: courseStructure ? outlineIndexData : undefined,
  });
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

  useEffect(() => {
    const { status, errors } = getCourseOutlineIndexRequestState({
      isPending: outlineIndexQuery.isPending,
      isSuccess: outlineIndexQuery.isSuccess,
      error: outlineIndexQuery.error,
    });

    dispatch(updateOutlineIndexLoadingStatus({ status, errors }));
  }, [dispatch, outlineIndexQuery.error, outlineIndexQuery.isPending, outlineIndexQuery.isSuccess]);

  useEffect(() => {
    if (!outlineIndexQuery.data) {
      return;
    }

    dispatch(fetchOutlineIndexSuccess(outlineIndexQuery.data));
    dispatch(updateStatusBar(getCourseOutlineStatusBarData(outlineIndexQuery.data)));
    dispatch(updateCourseActions(outlineIndexQuery.data.courseStructure.actions));
  }, [dispatch, outlineIndexQuery.data]);

  const handleAddAndOpenUnit = useCreateCourseBlock(courseId, openUnitPage);
  const handleAddBlock = useCreateCourseBlock(courseId);

  const {
    mutate: duplicateItem,
    isPending: isDuplicatingItem,
  } = useDuplicateItem(courseId);
  // parentId is required by the API to know where to insert the duplicate.
  // sectionId/subsectionId are required to invalidate the correct React Query caches after duplication.
  const handleDuplicateSubmit = (parentId: string | undefined) => {
    if (currentSelection?.currentId && parentId) {
      duplicateItem({
        itemId: currentSelection.currentId,
        parentId,
        sectionId: currentSelection.sectionId,
        subsectionId: currentSelection.subsectionId,
      });
    }
  };

  const handleDuplicateSectionSubmit = () => handleDuplicateSubmit(courseStructure.id);
  const handleDuplicateSubsectionSubmit = () => handleDuplicateSubmit(currentSelection?.sectionId);
  const handleDuplicateUnitSubmit = () => handleDuplicateSubmit(currentSelection?.subsectionId);

  const deleteMutation = useDeleteCourseItem();

  const getHandleDeleteItemSubmit = useCallback((callback: () => void) => async () => {
    // istanbul ignore if
    if (!currentSelection) {
      return;
    }
    const category = getBlockType(currentSelection.currentId);
    switch (category) {
      case COURSE_BLOCK_NAMES.chapter.id:
        await deleteMutation.mutateAsync(
          { itemId: currentSelection.currentId },
          { onSettled: () => dispatch(deleteSection({ itemId: currentSelection.currentId })) },
        );
        break;
      case COURSE_BLOCK_NAMES.sequential.id:
        await deleteMutation.mutateAsync(
          { itemId: currentSelection.currentId, sectionId: currentSelection.sectionId },
          {
            onSettled: () =>
              dispatch(deleteSubsection({
                itemId: currentSelection.currentId,
                sectionId: currentSelection.sectionId,
              })),
          },
        );
        break;
      case COURSE_BLOCK_NAMES.vertical.id:
        await deleteMutation.mutateAsync(
          {
            itemId: currentSelection.currentId,
            subsectionId: currentSelection.subsectionId,
            sectionId: currentSelection.sectionId,
          },
          {
            onSettled: () =>
              dispatch(deleteUnit({
                itemId: currentSelection.currentId,
                subsectionId: currentSelection.subsectionId,
                sectionId: currentSelection.sectionId,
              })),
          },
        );
        break;
      default:
        // istanbul ignore next
        throw new Error(`Unrecognized category ${category}`);
    }
    closeDeleteModal();
    callback();
  }, [deleteMutation, closeDeleteModal, currentSelection, dispatch]);

  const context = useMemo<CourseOutlineContextData>(() => ({
    handleAddBlock,
    handleAddAndOpenUnit,
    currentSelection,
    setCurrentSelection,
    isDuplicatingItem,
    isDeleteModalOpen,
    openDeleteModal,
    closeDeleteModal,
    getHandleDeleteItemSubmit,
    handleDuplicateSectionSubmit,
    handleDuplicateSubsectionSubmit,
    handleDuplicateUnitSubmit,
    isPublishModalOpen,
    currentPublishModalData,
    openPublishModal,
    closePublishModal,
  }), [
    handleAddBlock,
    handleAddAndOpenUnit,
    currentSelection,
    setCurrentSelection,
    isDuplicatingItem,
    isDeleteModalOpen,
    openDeleteModal,
    closeDeleteModal,
    getHandleDeleteItemSubmit,
    handleDuplicateSectionSubmit,
    handleDuplicateSubsectionSubmit,
    handleDuplicateUnitSubmit,
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
