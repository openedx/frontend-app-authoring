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
import { arrayMove } from '@dnd-kit/sortable';

import { SelectionState, type XBlock } from '@src/data/types';
import { useToggleWithValue } from '@src/hooks';
import { getBlockType } from '@src/generic/key-utils';
import { COURSE_BLOCK_NAMES } from '@src/constants';
import { useCourseAuthoringContext, type ModalState } from '@src/CourseAuthoringContext';
import {
  useCreateCourseBlock,
  useDeleteCourseItem,
  useDuplicateItem,
} from './data/apiHooks';
import { getOutlineIndexData, getSectionsList } from './data/selectors';
import {
  fetchCourseOutlineIndexQuery,
  setSectionOrderListQuery,
  setSubsectionOrderListQuery,
  setUnitOrderListQuery,
} from './data/thunk';
import { deleteSection, deleteSubsection, deleteUnit } from './data/slice';

export type CourseOutlineContextData = {
  handleAddAndOpenUnit: ReturnType<typeof useCreateCourseBlock>;
  handleAddBlock: ReturnType<typeof useCreateCourseBlock>;
  currentSelection?: SelectionState;
  setCurrentSelection: React.Dispatch<React.SetStateAction<SelectionState | undefined>>;
  sections: XBlock[];
  restoreSectionList: () => void;
  setSections: React.Dispatch<React.SetStateAction<XBlock[]>>;
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
  handleSectionDragAndDrop: (sectionListIds: string[]) => void;
  handleSubsectionDragAndDrop: (sectionId: string, prevSectionId: string, subsectionListIds: string[]) => void;
  handleUnitDragAndDrop: (
    sectionId: string,
    prevSectionId: string,
    subsectionId: string,
    unitListIds: string[],
  ) => void;
  updateSectionOrderByIndex: (currentIndex: number, newIndex: number) => void;
  updateSubsectionOrderByIndex: (section: XBlock, moveDetails: any) => void;
  updateUnitOrderByIndex: (section: XBlock, moveDetails: any) => void;
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
  const { courseStructure } = useSelector(getOutlineIndexData);
  const sectionsList = useSelector(getSectionsList);
  const [sections, setSections] = useState<XBlock[]>(sectionsList);
  const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useToggle(false);
  const [
    isPublishModalOpen,
    currentPublishModalData,
    openPublishModal,
    closePublishModal,
  ] = useToggleWithValue<ModalState>();

  /**
   * This will hold the state of current item that is being operated on,
   * For example:
   *  - the details of container that is being edited.
   *  - the details of container of which see more dropdown is open.
   * It is mostly used in modals which should be soon be replaced with its equivalent in sidebar.
   */
  const [currentSelection, setCurrentSelection] = useState<SelectionState | undefined>();

  const restoreSectionList = () => {
    setSections(() => [...sectionsList]);
  };

  useEffect(() => {
    dispatch(fetchCourseOutlineIndexQuery(courseId));
  }, [courseId]);

  useEffect(() => {
    setSections(sectionsList);
  }, [sectionsList]);

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

  const handleSectionDragAndDrop = (sectionListIds: string[]) => {
    dispatch(setSectionOrderListQuery(courseId, sectionListIds, restoreSectionList));
  };

  const handleSubsectionDragAndDrop = (
    sectionId: string,
    prevSectionId: string,
    subsectionListIds: string[],
  ) => {
    dispatch(setSubsectionOrderListQuery(sectionId, prevSectionId, subsectionListIds, restoreSectionList));
  };

  const handleUnitDragAndDrop = (
    sectionId: string,
    prevSectionId: string,
    subsectionId: string,
    unitListIds: string[],
  ) => {
    dispatch(setUnitOrderListQuery(sectionId, subsectionId, prevSectionId, unitListIds, restoreSectionList));
  };

  /** Move section to new index */
  const updateSectionOrderByIndex = (currentIndex: number, newIndex: number) => {
    if (currentIndex === newIndex) {
      return;
    }
    setSections((prevSections) => {
      const newSections = arrayMove(prevSections, currentIndex, newIndex);
      handleSectionDragAndDrop(newSections.map((section) => section.id));
      return newSections;
    });
  };

  /** Uses details from move information and moves subsection */
  const updateSubsectionOrderByIndex = (section: XBlock, moveDetails) => {
    const { fn, args, sectionId } = moveDetails;
    if (!args) {
      return;
    }
    const [sectionsCopy, newSubsections] = fn(...args);
    if (newSubsections && sectionId) {
      setSections(sectionsCopy);
      handleSubsectionDragAndDrop(sectionId, section.id, newSubsections.map((subsection) => subsection.id));
    }
  };

  /** Uses details from move information and moves unit */
  const updateUnitOrderByIndex = (section: XBlock, moveDetails) => {
    const { fn, args, sectionId, subsectionId } = moveDetails;
    if (!args) {
      return;
    }
    const [sectionsCopy, newUnits] = fn(...args);
    if (newUnits && subsectionId) {
      setSections(sectionsCopy);
      handleUnitDragAndDrop(sectionId, section.id, subsectionId, newUnits.map((unit) => unit.id));
    }
  };

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
    sections,
    restoreSectionList,
    setSections,
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
    handleSectionDragAndDrop,
    handleSubsectionDragAndDrop,
    handleUnitDragAndDrop,
    updateSectionOrderByIndex,
    updateSubsectionOrderByIndex,
    updateUnitOrderByIndex,
  }), [
    handleAddBlock,
    handleAddAndOpenUnit,
    currentSelection,
    setCurrentSelection,
    sections,
    restoreSectionList,
    setSections,
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
    handleSectionDragAndDrop,
    handleSubsectionDragAndDrop,
    handleUnitDragAndDrop,
    updateSectionOrderByIndex,
    updateSubsectionOrderByIndex,
    updateUnitOrderByIndex,
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
