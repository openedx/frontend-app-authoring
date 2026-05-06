import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { arrayMove } from '@dnd-kit/sortable';
import { useQueryClient } from '@tanstack/react-query';

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
import { replaceSectionInOutlineIndex, useCourseItemData } from './data/apiHooks';
import {
  setSectionOrderListQuery,
  setSubsectionOrderListQuery,
  setUnitOrderListQuery,
} from './data/thunk';
import {
  courseOutlineIndexQueryKey,
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

  // Redux store reference for reading updated state in success callbacks
  const store = useStore();

  // Query client for updating React Query cache after reorder
  const queryClient = useQueryClient();

  // Course ID from context (primary source)
  const { courseId } = useCourseAuthoringContext();

  // Mount outline index query from React Query (primary source)
  const outlineIndexQuery = useCourseOutlineIndex(courseId, {
    initialData: outlineIndexData?.courseStructure ? outlineIndexData : undefined,
  });

  // Effective outline data — prefer React Query cache, fall back to Redux facade
  const effectiveOutlineIndexData = outlineIndexQuery.data || outlineIndexData;

  // Committed sections from query cache (PR 9: primary source), fall back to Redux sectionsList
  const sections = effectiveOutlineIndexData?.courseStructure?.childInfo?.children || sectionsList;

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

  // Helper: accept reorder preview then read updated sections from Redux
  // and sync them to React Query cache via replaceSectionInOutlineIndex.
  const acceptReorderAndSyncSections = useCallback((
    primarySectionId: string,
    secondarySectionId?: string,
  ) => {
    acceptReorderPreview();
    const state = store.getState();
    const sectionIds = [primarySectionId];
    if (secondarySectionId && secondarySectionId !== primarySectionId) {
      sectionIds.push(secondarySectionId);
    }
    const updatedSections: Record<string, any> = {};
    const sectionsList = getSectionsList(state);
    sectionIds.forEach(id => {
      const s = sectionsList.find((s: any) => s.id === id);
      if (s) updatedSections[id] = s;
    });
    if (Object.keys(updatedSections).length > 0) {
      replaceSectionInOutlineIndex(queryClient, courseId, updatedSections);
    }
  }, [acceptReorderPreview, store, queryClient, courseId]);

  // Helper: accept reorder preview then sync React Query cache with new section order
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
      () => acceptReorderAndSyncSectionOrder(sectionListIds),
    ));
  }, [courseId, dispatch, captureOriginalSections, rollbackReorderPreview, acceptReorderAndSyncSectionOrder]);

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
      () => {
        acceptReorderAndSyncSections(sectionId, prevSectionId);
      },
    ));
  }, [dispatch, captureOriginalSections, rollbackReorderPreview, acceptReorderAndSyncSections]);

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
      () => {
        acceptReorderAndSyncSections(sectionId, prevSectionId);
      },
    ));
  }, [dispatch, captureOriginalSections, rollbackReorderPreview, acceptReorderAndSyncSections]);

  const updateSectionOrderByIndex = useCallback((currentIndex: number, newIndex: number) => {
    if (!courseId || currentIndex === newIndex) {
      return;
    }

    const previousSections = visibleSections;
    previousSectionsRef.current = previousSections;
    const nextSections = arrayMove(visibleSections, currentIndex, newIndex) as XBlock[];
    const sectionListIds = nextSections.map((section) => section.id);
    setPreviewSections(nextSections);

    dispatch(setSectionOrderListQuery(
      courseId,
      sectionListIds,
      rollbackReorderPreview,
      () => acceptReorderAndSyncSectionOrder(sectionListIds),
    ));
  }, [visibleSections, courseId, dispatch, rollbackReorderPreview, acceptReorderAndSyncSectionOrder]);

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
        () => {
          acceptReorderAndSyncSections(sectionId, section.id);
        },
      ));
    }
  }, [visibleSections, dispatch, rollbackReorderPreview, acceptReorderAndSyncSections]);

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
        () => {
          acceptReorderAndSyncSections(sectionId, section.id);
        },
      ));
    }
  }, [visibleSections, dispatch, rollbackReorderPreview, acceptReorderAndSyncSections]);

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
    outlineIndexData: effectiveOutlineIndexData,
    courseName: effectiveOutlineIndexData?.courseStructure?.displayName,
    courseUsageKey: effectiveOutlineIndexData?.courseStructure?.id || courseId,
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
    effectiveOutlineIndexData,
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
