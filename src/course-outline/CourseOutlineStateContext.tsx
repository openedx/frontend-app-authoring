import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import {
  getCourseOutlineIndexRequestState,
  getCourseOutlineStatusBarData,
  useCourseOutlineIndex,
} from './data/outlineIndexQuery';
import {
  fetchOutlineIndexSuccess,
  updateCourseActions,
  updateOutlineIndexLoadingStatus,
  updateStatusBar,
} from './data/slice';

import { buildSelectionState } from './state/selection';
import {
  EditableSubsection,
  getLastEditableItem,
  getLastEditableSubsection,
} from './state/editability';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';

import {
  CourseOutlineState as LegacyCourseOutlineState,
  CourseOutlineStatusBar,
} from './data/types';

type CourseOutlineStateContextData = {
  outlineIndexData: LegacyCourseOutlineState['outlineIndexData'];
  courseName?: string;
  courseUsageKey?: string;
  sections: XBlock[];
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
  // Intent-level drag handlers (PR 8 cleanup)
  previewSections: (nextSections: XBlock[]) => void;
  cancelReorderPreview: () => void;
  commitSectionReorder: (sectionListIds: string[]) => void;
  commitSubsectionReorder: (sectionId: string, prevSectionId: string, subsectionListIds: string[]) => void;
  commitUnitReorder: (sectionId: string, prevSectionId: string, subsectionId: string, unitListIds: string[]) => void;
};

const CourseOutlineStateContext = createContext<CourseOutlineStateContextData | undefined>(undefined);

export const CourseOutlineStateProvider = ({ children }: { children?: React.ReactNode }) => {
  const dispatch = useDispatch();

  // Redux selectors for all state
  const outlineIndexData = useSelector(getOutlineIndexData);
  const sectionsList = useSelector(getSectionsList);
  const loadingStatus = useSelector(getLoadingStatus);
  const savingStatus = useSelector(getSavingStatus);
  const errors = useSelector(getErrors);
  const statusBarData = useSelector(getStatusBarData);
  const courseActions = useSelector(getCourseActions);
  const isCustomRelativeDatesActive = useSelector(getCustomRelativeDatesActiveFlag);
  const enableProctoredExams = useSelector(getProctoredExamsFlag);
  const enableTimedExams = useSelector(getTimedExamsFlag);
  const createdOn = useSelector(getCreatedOn);

  // Sections from Redux (PR 8: primary source during transition)
  const sections = sectionsList;

  // Course ID from context (primary source)
  const { courseId } = useCourseAuthoringContext();

  // Mount outline index query from React Query
  const outlineIndexQuery = useCourseOutlineIndex(courseId, {
    initialData: outlineIndexData?.courseStructure ? outlineIndexData : undefined,
  });

  // Sync query state to Redux loading status
  useEffect(() => {
    const { status, errors } = getCourseOutlineIndexRequestState({
      isPending: outlineIndexQuery.isPending,
      isSuccess: outlineIndexQuery.isSuccess,
      error: outlineIndexQuery.error,
    });

    dispatch(updateOutlineIndexLoadingStatus({ status, errors }));
  }, [dispatch, outlineIndexQuery.error, outlineIndexQuery.isPending, outlineIndexQuery.isSuccess]);

  // Sync query data to Redux on success
  useEffect(() => {
    if (!outlineIndexQuery.data) {
      return;
    }

    dispatch(fetchOutlineIndexSuccess(outlineIndexQuery.data));
    dispatch(updateStatusBar(getCourseOutlineStatusBarData(outlineIndexQuery.data)));
    dispatch(updateCourseActions(outlineIndexQuery.data.courseStructure.actions));
  }, [dispatch, outlineIndexQuery.data]);

  // Preview state: undefined means show sections, array means show preview
  const [previewSections, setPreviewSections] = useState<XBlock[] | undefined>();

  // Ref to track original sections captured at drag start (restore target on failure)
  const previousSectionsRef = useRef<XBlock[] | undefined>();

  // Current visible sections = previewSections ?? sections
  const visibleSections = previewSections ?? sections;

  // Helper: capture original tree once at first preview update
  const captureOriginalSections = useCallback(() => {
    if (!previousSectionsRef.current) {
      previousSectionsRef.current = visibleSections;
    }
  }, [visibleSections]);

  // Helper: clear preview and snapshot (used as rollback callback on failure)
  const rollbackReorderPreview = useCallback(() => {
    setPreviewSections(undefined);
    previousSectionsRef.current = undefined;
  }, []);

  // Helper: clear preview and snapshot (used as success callback)
  const acceptReorderPreview = useCallback(() => {
    setPreviewSections(undefined);
    previousSectionsRef.current = undefined;
  }, []);

  // Cancel preview and restore to committed (current) state
  const cancelReorderPreview = useCallback(() => {
    setPreviewSections(undefined);
    previousSectionsRef.current = undefined;
  }, []);

  // Preview callback from DraggableList — captures original tree once, then updates preview
  const previewSectionsCallback = useCallback((nextSections: XBlock[]) => {
    captureOriginalSections();
    setPreviewSections(nextSections);
  }, [captureOriginalSections]);

  // Commit section reorder — keeps preview visible until request settles
  const commitSectionReorder = useCallback((sectionListIds: string[]) => {
    if (!courseId) {
      return;
    }

    captureOriginalSections();
    dispatch(setSectionOrderListQuery(
      courseId,
      sectionListIds,
      rollbackReorderPreview,
      acceptReorderPreview,
    ));
  }, [courseId, dispatch, captureOriginalSections, rollbackReorderPreview, acceptReorderPreview]);

  // Commit subsection reorder
  const commitSubsectionReorder = useCallback((
    sectionId: string,
    prevSectionId: string,
    subsectionListIds: string[],
  ) => {
    captureOriginalSections();
    dispatch(setSubsectionOrderListQuery(
      sectionId,
      prevSectionId,
      subsectionListIds,
      rollbackReorderPreview,
      acceptReorderPreview,
    ));
  }, [dispatch, captureOriginalSections, rollbackReorderPreview, acceptReorderPreview]);

  // Commit unit reorder
  const commitUnitReorder = useCallback((
    sectionId: string,
    prevSectionId: string,
    subsectionId: string,
    unitListIds: string[],
  ) => {
    captureOriginalSections();
    dispatch(setUnitOrderListQuery(
      sectionId,
      subsectionId,
      prevSectionId,
      unitListIds,
      rollbackReorderPreview,
      acceptReorderPreview,
    ));
  }, [dispatch, captureOriginalSections, rollbackReorderPreview, acceptReorderPreview]);

  const updateSectionOrderByIndex = useCallback((currentIndex: number, newIndex: number) => {
    if (!courseId || currentIndex === newIndex) {
      return;
    }

    const previousSections = visibleSections;
    previousSectionsRef.current = previousSections;
    const nextSections = arrayMove(visibleSections, currentIndex, newIndex) as XBlock[];
    setPreviewSections(nextSections);

    dispatch(setSectionOrderListQuery(
      courseId,
      nextSections.map((section) => section.id),
      rollbackReorderPreview,
      acceptReorderPreview,
    ));
  }, [visibleSections, courseId, dispatch, rollbackReorderPreview, acceptReorderPreview]);

  const updateSubsectionOrderByIndex = useCallback((section: XBlock, moveDetails) => {
    const { fn, args, sectionId } = moveDetails;
    if (!args) {
      return;
    }

    const previousSections = visibleSections;
    previousSectionsRef.current = previousSections;
    const [sectionsCopy, newSubsections] = fn(...args);
    if (newSubsections && sectionId) {
      setPreviewSections(sectionsCopy);
      dispatch(setSubsectionOrderListQuery(
        sectionId,
        section.id,
        newSubsections.map((subsection: XBlock) => subsection.id),
        rollbackReorderPreview,
        acceptReorderPreview,
      ));
    }
  }, [visibleSections, dispatch, rollbackReorderPreview, acceptReorderPreview]);

  const updateUnitOrderByIndex = useCallback((section: XBlock, moveDetails) => {
    const { fn, args, sectionId, subsectionId } = moveDetails;
    if (!args) {
      return;
    }

    const previousSections = visibleSections;
    previousSectionsRef.current = previousSections;
    const [sectionsCopy, newUnits] = fn(...args);
    if (newUnits && subsectionId) {
      setPreviewSections(sectionsCopy);
      dispatch(setUnitOrderListQuery(
        sectionId,
        subsectionId,
        section.id,
        newUnits.map((unit: XBlock) => unit.id),
        rollbackReorderPreview,
        acceptReorderPreview,
      ));
    }
  }, [visibleSections, dispatch, rollbackReorderPreview, acceptReorderPreview]);

  const [currentSelection, setCurrentSelection] = useState<SelectionState | undefined>();
  const { data: currentItemData } = useCourseItemData(currentSelection?.currentId);

  const lastEditableSection = useMemo(() => {
    if (currentItemData?.category === 'chapter' && currentItemData.actions.childAddable) {
      return currentItemData as XBlock;
    }
    return currentItemData ? undefined : getLastEditableItem(sections);
  }, [currentItemData, sections]);

  const lastEditableSubsection = useMemo((): EditableSubsection | undefined => {
    if (currentItemData?.category === 'sequential' && currentItemData.actions.childAddable) {
      return { data: currentItemData as XBlock, sectionId: currentSelection?.sectionId };
    }
    if (currentItemData?.category === 'chapter') {
      return {
        data: getLastEditableItem((currentItemData as XBlock).childInfo?.children || []) as XBlock,
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
    courseUsageKey: courseId,
    sections: visibleSections,
    updateSectionOrderByIndex,
    updateSubsectionOrderByIndex,
    updateUnitOrderByIndex,
    courseActions,
    statusBarData,
    savingStatus,
    errors,
    loadingStatus,
    // Use legacy Redux loading status
    isLoading: loadingStatus.outlineIndexLoadingStatus === RequestStatus.IN_PROGRESS,
    isLoadingDenied: loadingStatus.outlineIndexLoadingStatus === RequestStatus.DENIED,
    isCustomRelativeDatesActive,
    enableProctoredExams,
    enableTimedExams,
    createdOn,
    currentItemData: currentItemData as XBlock | undefined,
    lastEditableSection,
    lastEditableSubsection,
    currentSelection,
    selectContainer,
    clearSelection,
    openContainerInfo,
    // Intent-level drag handlers
    previewSections: previewSectionsCallback,
    cancelReorderPreview,
    commitSectionReorder,
    commitSubsectionReorder,
    commitUnitReorder,
  }), [
    outlineIndexData,
    courseId,
    visibleSections,
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
    previewSectionsCallback,
    cancelReorderPreview,
    commitSectionReorder,
    commitSubsectionReorder,
    commitUnitReorder,
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
