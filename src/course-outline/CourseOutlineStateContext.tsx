import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { arrayMove } from '@dnd-kit/sortable';

import { RequestStatus } from '@src/data/constants';
import type {
  OutlinePageErrors,
  SelectionState,
  XBlock,
  XBlockActions,
} from '@src/data/types';
import {
  getCourseActions,
  getCreatedOn,
  getCustomRelativeDatesActiveFlag,
  getErrors,
  getLoadingStatus,
  getOutlineIndexData,
  getSavingStatus,
  getSectionsList,
  getStatusBarData,
  getProctoredExamsFlag,
  getTimedExamsFlag,
} from './data/selectors';
import { useCourseItemData } from './data/apiHooks';
import {
  setSectionOrderListQuery,
  setSubsectionOrderListQuery,
  setUnitOrderListQuery,
} from './data/thunk';
import { buildSelectionState } from './state/selection';
import {
  EditableSubsection,
  getLastEditableItem,
  getLastEditableSubsection,
} from './state/editability';
import { CourseOutlineState as LegacyCourseOutlineState, CourseOutlineStatusBar } from './data/types';

type CourseOutlineStateContextData = {
  outlineIndexData: LegacyCourseOutlineState['outlineIndexData'];
  courseName?: string;
  courseUsageKey?: string;
  sections: XBlock[];
  setSections: React.Dispatch<React.SetStateAction<XBlock[]>>;
  restoreSectionList: () => void;
  handleSectionDragAndDrop: (sectionListIds: string[], restoreCallback?: () => void) => void;
  handleSubsectionDragAndDrop: (
    sectionId: string,
    prevSectionId: string,
    subsectionListIds: string[],
    restoreCallback?: () => void,
  ) => void;
  handleUnitDragAndDrop: (
    sectionId: string,
    prevSectionId: string,
    subsectionId: string,
    unitListIds: string[],
    restoreCallback?: () => void,
  ) => void;
  updateSectionOrderByIndex: (currentIndex: number, newIndex: number) => void;
  updateSubsectionOrderByIndex: (section: XBlock, moveDetails: any) => void;
  updateUnitOrderByIndex: (section: XBlock, moveDetails: any) => void;
  courseActions: XBlockActions;
  statusBarData: CourseOutlineStatusBar;
  savingStatus: string;
  errors: OutlinePageErrors;
  loadingStatus: LegacyCourseOutlineState['loadingStatus'];
  isLoading: boolean;
  isLoadingDenied: boolean;
  isCustomRelativeDatesActive: boolean;
  enableProctoredExams?: boolean;
  enableTimedExams?: boolean;
  createdOn: LegacyCourseOutlineState['createdOn'];
  currentItemData?: XBlock;
  lastEditableSection?: XBlock;
  lastEditableSubsection?: EditableSubsection;
  currentSelection?: SelectionState;
  selectContainer: (selection?: SelectionState) => void;
  clearSelection: () => void;
  openContainerInfo: (
    containerId: string,
    subsectionId?: string,
    sectionId?: string,
    index?: number,
  ) => void;
};

const CourseOutlineStateContext = createContext<CourseOutlineStateContextData | undefined>(undefined);

export const CourseOutlineStateProvider = ({ children }: { children?: React.ReactNode }) => {
  const dispatch = useDispatch();
  const outlineIndexData = useSelector(getOutlineIndexData);
  const sectionsList = useSelector(getSectionsList);
  const [sections, setSections] = useState<XBlock[]>(sectionsList);
  const courseActions = useSelector(getCourseActions);
  const statusBarData = useSelector(getStatusBarData);
  const savingStatus = useSelector(getSavingStatus);
  const errors = useSelector(getErrors);
  const loadingStatus = useSelector(getLoadingStatus);
  const isCustomRelativeDatesActive = useSelector(getCustomRelativeDatesActiveFlag);
  const enableProctoredExams = useSelector(getProctoredExamsFlag);
  const enableTimedExams = useSelector(getTimedExamsFlag);
  const createdOn = useSelector(getCreatedOn);
  const [currentSelection, setCurrentSelection] = useState<SelectionState | undefined>();
  const { data: currentItemData } = useCourseItemData<XBlock>(currentSelection?.currentId);

  useEffect(() => {
    setSections(sectionsList);
  }, [sectionsList]);

  const restoreSectionList = useCallback(() => {
    setSections(() => [...sectionsList]);
  }, [sectionsList]);

  const courseId = outlineIndexData?.courseStructure?.id;

  const handleSectionDragAndDrop = useCallback((sectionListIds: string[], restoreCallback = restoreSectionList) => {
    if (!courseId) {
      return;
    }
    dispatch(setSectionOrderListQuery(courseId, sectionListIds, restoreCallback));
  }, [courseId, dispatch, restoreSectionList]);

  const handleSubsectionDragAndDrop = useCallback((
    sectionId: string,
    prevSectionId: string,
    subsectionListIds: string[],
    restoreCallback = restoreSectionList,
  ) => {
    dispatch(setSubsectionOrderListQuery(sectionId, prevSectionId, subsectionListIds, restoreCallback));
  }, [dispatch, restoreSectionList]);

  const handleUnitDragAndDrop = useCallback((
    sectionId: string,
    prevSectionId: string,
    subsectionId: string,
    unitListIds: string[],
    restoreCallback = restoreSectionList,
  ) => {
    dispatch(setUnitOrderListQuery(sectionId, subsectionId, prevSectionId, unitListIds, restoreCallback));
  }, [dispatch, restoreSectionList]);

  const updateSectionOrderByIndex = useCallback((currentIndex: number, newIndex: number) => {
    if (currentIndex === newIndex) {
      return;
    }
    setSections((prevSections) => {
      const newSections = arrayMove(prevSections, currentIndex, newIndex);
      handleSectionDragAndDrop(newSections.map((section) => section.id), restoreSectionList);
      return newSections;
    });
  }, [handleSectionDragAndDrop, restoreSectionList]);

  const updateSubsectionOrderByIndex = useCallback((section: XBlock, moveDetails) => {
    const { fn, args, sectionId } = moveDetails;
    if (!args) {
      return;
    }
    const [sectionsCopy, newSubsections] = fn(...args);
    if (newSubsections && sectionId) {
      setSections(sectionsCopy);
      handleSubsectionDragAndDrop(
        sectionId,
        section.id,
        newSubsections.map((subsection) => subsection.id),
        restoreSectionList,
      );
    }
  }, [handleSubsectionDragAndDrop, restoreSectionList]);

  const updateUnitOrderByIndex = useCallback((section: XBlock, moveDetails) => {
    const { fn, args, sectionId, subsectionId } = moveDetails;
    if (!args) {
      return;
    }
    const [sectionsCopy, newUnits] = fn(...args);
    if (newUnits && subsectionId) {
      setSections(sectionsCopy);
      handleUnitDragAndDrop(
        sectionId,
        section.id,
        subsectionId,
        newUnits.map((unit) => unit.id),
        restoreSectionList,
      );
    }
  }, [handleUnitDragAndDrop, restoreSectionList]);

  const lastEditableSection = useMemo(() => {
    if (currentItemData?.category === 'chapter' && currentItemData.actions.childAddable) {
      return currentItemData;
    }
    return currentItemData ? undefined : getLastEditableItem(sections);
  }, [currentItemData, sections]);

  const lastEditableSubsection = useMemo(() => {
    if (currentItemData?.category === 'sequential' && currentItemData.actions.childAddable) {
      return { data: currentItemData, sectionId: currentSelection?.sectionId };
    }
    if (currentItemData?.category === 'chapter') {
      return {
        data: getLastEditableItem(currentItemData?.childInfo.children || []),
        sectionId: currentSelection?.currentId,
      };
    }
    return currentItemData ? undefined : getLastEditableSubsection(sections);
  }, [currentItemData, sections, currentSelection]);

  const selectContainer = useCallback((selection?: SelectionState) => {
    setCurrentSelection(selection);
  }, []);

  const clearSelection = useCallback(() => {
    setCurrentSelection(undefined);
  }, []);

  const openContainerInfo = useCallback((
    containerId: string,
    subsectionId?: string,
    sectionId?: string,
    index?: number,
  ) => {
    setCurrentSelection(buildSelectionState({
      currentId: containerId,
      subsectionId,
      sectionId,
      index,
    }));
  }, []);

  const context = useMemo<CourseOutlineStateContextData>(() => ({
    outlineIndexData,
    courseName: outlineIndexData?.courseStructure?.displayName,
    courseUsageKey: outlineIndexData?.courseStructure?.id,
    sections,
    setSections,
    restoreSectionList,
    handleSectionDragAndDrop,
    handleSubsectionDragAndDrop,
    handleUnitDragAndDrop,
    updateSectionOrderByIndex,
    updateSubsectionOrderByIndex,
    updateUnitOrderByIndex,
    courseActions,
    statusBarData,
    savingStatus,
    errors,
    loadingStatus,
    isLoading: loadingStatus.outlineIndexLoadingStatus === RequestStatus.IN_PROGRESS,
    isLoadingDenied: loadingStatus.outlineIndexLoadingStatus === RequestStatus.DENIED,
    isCustomRelativeDatesActive,
    enableProctoredExams,
    enableTimedExams,
    createdOn,
    currentItemData,
    lastEditableSection,
    lastEditableSubsection,
    currentSelection,
    selectContainer,
    clearSelection,
    openContainerInfo,
  }), [
    outlineIndexData,
    sections,
    setSections,
    restoreSectionList,
    handleSectionDragAndDrop,
    handleSubsectionDragAndDrop,
    handleUnitDragAndDrop,
    updateSectionOrderByIndex,
    updateSubsectionOrderByIndex,
    updateUnitOrderByIndex,
    courseActions,
    statusBarData,
    savingStatus,
    errors,
    loadingStatus,
    isCustomRelativeDatesActive,
    enableProctoredExams,
    enableTimedExams,
    createdOn,
    currentItemData,
    lastEditableSection,
    lastEditableSubsection,
    currentSelection,
    selectContainer,
    clearSelection,
    openContainerInfo,
  ]);

  return (
    <CourseOutlineStateContext.Provider value={context}>
      {children}
    </CourseOutlineStateContext.Provider>
  );
};

export function useCourseOutlineState(): CourseOutlineStateContextData {
  const ctx = useContext(CourseOutlineStateContext);
  if (ctx === undefined) {
    throw new Error('useCourseOutlineState() was used in a component without a <CourseOutlineStateProvider> ancestor.');
  }
  return ctx;
}
