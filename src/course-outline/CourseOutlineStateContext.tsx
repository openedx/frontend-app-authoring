import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import moment from 'moment';

import { RequestStatus } from '@src/data/constants';
import type {
  OutlinePageErrors,
  SelectionState,
  XBlock,
  XBlockActions,
} from '@src/data/types';
import { useCourseItemData } from './data/apiHooks';

import {
  getCourseOutlineIndexRequestState,
  getCourseOutlineStatusBarData,
  useCourseOutlineIndex,
} from './data/outlineIndexQuery';
import {
  createDiscussionsTopics,
  getCourseLaunch,
  getCourseBestPractices,
} from './data/api';
import { getErrorDetails } from './utils/getErrorDetails';
import {
  getCourseBestPracticesChecklist,
  getCourseLaunchChecklist,
} from './utils/getChecklistForStatusBar';

import { useOutlineMutations } from './state/useOutlineMutations';
import { useOutlineReorderState } from './state/useOutlineReorderState';
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
  ChecklistType,
} from './data/types';

type CourseOutlineStateContextData = {
  outlineIndexData: LegacyCourseOutlineState['outlineIndexData'];
  courseName?: string;
  courseUsageKey?: string;
  sections: XBlock[];
  updateSectionOrderByIndex: (currentIndex: number, newIndex: number) => Promise<void>;
  updateSubsectionOrderByIndex: (section: XBlock, moveDetails: any) => Promise<void>;
  updateUnitOrderByIndex: (section: XBlock, moveDetails: any) => Promise<void>;
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
  createdOn?: string;
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
  commitSectionReorder: (sectionListIds: string[]) => Promise<void>;
  commitSubsectionReorder: (sectionId: string, prevSectionId: string, subsectionListIds: string[]) => Promise<void>;
  commitUnitReorder: (sectionId: string, prevSectionId: string, subsectionId: string, unitListIds: string[]) => Promise<void>;

  // Mutation methods (PR 10)
  deleteCurrentSelection: (selection: SelectionState) => Promise<void>;
  duplicateCurrentSelection: (selection: SelectionState) => void;
  configureCurrentSelection: (selection: SelectionState, variables: any) => void;
  pasteClipboardContent: (parentLocator: string, subsectionId?: string, sectionId?: string) => void;
  updateHighlightsForCurrentSelection: (selection: SelectionState, highlights: Record<string, string | false>) => void;
  enableHighlightsEmails: () => Promise<void>;
  changeVideoSharingOption: (value: string) => void;
  dismissNotification: () => void;
  dismissError: (key: string) => void;
  reindexCourse: () => Promise<void>;
  setSavingStatus: (status: string) => void;
};

// Default actions when outline data hasn't loaded or has no actions
const DEFAULT_COURSE_ACTIONS: XBlockActions = {
  deletable: true,
  unlinkable: false,
  draggable: true,
  childAddable: true,
  duplicable: true,
  allowMoveUp: false,
  allowMoveDown: false,
};

const DEFAULT_LAUNCH_STATUS = RequestStatus.IN_PROGRESS;
const DEFAULT_FETCH_SECTION_STATUS = RequestStatus.IN_PROGRESS;
const DEFAULT_ERROR_NULL = null;

const CourseOutlineStateContext = createContext<CourseOutlineStateContextData | undefined>(undefined);

export const CourseOutlineStateProvider = ({ children }: { children?: React.ReactNode }) => {
  // Query client for updating React Query cache after reorder
  const queryClient = useQueryClient();

  // Course ID from context (primary source)
  const { courseId } = useCourseAuthoringContext();

  // Mount outline index query from React Query (primary source, no Redux facade)
  const outlineIndexQuery = useCourseOutlineIndex(courseId);

  // Local state for dismissed errors (persists filter across renders)
  const [dismissedErrorKeys, setDismissedErrorKeys] = useState<Set<string>>(new Set());
  // Reindex loading status (set by reindexCourse callback)
  const [reindexLoadingStatus, setReindexLoadingStatus] = useState<string>(RequestStatus.IN_PROGRESS);
  // Reindex error details (set by reindexCourse catch)
  const [localReindexError, setLocalReindexError] = useState<any>(null);
  // Local override for status bar (set by changeVideoSharingOption)
  const [localStatusBarOverride, setLocalStatusBarOverride] = useState<Partial<CourseOutlineStatusBar>>({});
  // Saving status (set by mutation helpers)
  const [savingStatus, setSavingStatusState] = useState('');

  // --- Query-derived state (no Redux) ---

  // Effective outline data from React Query cache
  const effectiveOutlineIndexData = outlineIndexQuery.data;

  // Derive outline-index loading/error state from live query
  const outlineIndexRequestState = useMemo(() => getCourseOutlineIndexRequestState({
    isPending: outlineIndexQuery.isPending,
    isSuccess: outlineIndexQuery.isSuccess,
    error: outlineIndexQuery.error,
  }), [outlineIndexQuery.error, outlineIndexQuery.isPending, outlineIndexQuery.isSuccess]);

  // Committed sections from query cache children
  const sections = effectiveOutlineIndexData?.courseStructure?.childInfo?.children || [];

  // --- Local state for checklist, launch, and self-paced (replaces Redux dispatch-based effects) ---
  const [localChecklist, setLocalChecklist] = useState<ChecklistType>({
    totalCourseLaunchChecks: 0,
    completedCourseLaunchChecks: 0,
    totalCourseBestPracticesChecks: 0,
    completedCourseBestPracticesChecks: 0,
  });
  const [localIsSelfPaced, setLocalIsSelfPaced] = useState<boolean>(false);
  const [localCourseLaunchQueryStatus, setLocalCourseLaunchQueryStatus] = useState<string>(DEFAULT_LAUNCH_STATUS);
  const [localCourseLaunchErrors, setLocalCourseLaunchErrors] = useState<any>(null);

  // --- Derived flags from outline data ---
  const courseActions = effectiveOutlineIndexData?.courseStructure?.actions || DEFAULT_COURSE_ACTIONS;
  const isCustomRelativeDatesActive = effectiveOutlineIndexData?.isCustomRelativeDatesActive ?? false;
  const enableProctoredExams = effectiveOutlineIndexData?.courseStructure?.enableProctoredExams;
  const enableTimedExams = effectiveOutlineIndexData?.courseStructure?.enableTimedExams;
  const createdOn = effectiveOutlineIndexData?.createdOn;

  // --- Derived status bar data (merge query data + local checklist/selfPaced + overrides) ---
  const statusBarData = useMemo(() => {
    const base = effectiveOutlineIndexData
      ? getCourseOutlineStatusBarData(effectiveOutlineIndexData)
      : {};
    return {
      ...base,
      checklist: localChecklist,
      isSelfPaced: localIsSelfPaced,
      ...localStatusBarOverride,
    } as CourseOutlineStatusBar;
  }, [effectiveOutlineIndexData, localChecklist, localIsSelfPaced, localStatusBarOverride]);

  // --- Derived loading status (query-derived + local) ---
  const effectiveLoadingStatus = useMemo(() => ({
    outlineIndexLoadingStatus: outlineIndexRequestState.status,
    reIndexLoadingStatus: reindexLoadingStatus,
    fetchSectionLoadingStatus: DEFAULT_FETCH_SECTION_STATUS,
    courseLaunchQueryStatus: localCourseLaunchQueryStatus,
  }), [outlineIndexRequestState.status, reindexLoadingStatus, localCourseLaunchQueryStatus]);

  // --- Derived errors (query-derived + local, minus dismissed keys) ---
  const effectiveErrors = useMemo((): Record<string, any> => {
    const base = {
      outlineIndexApi: outlineIndexRequestState.errors,
      reindexApi: localReindexError,
      sectionLoadingApi: DEFAULT_ERROR_NULL,
      courseLaunchApi: localCourseLaunchErrors,
    };
    const filtered = { ...base };
    dismissedErrorKeys.forEach(key => { filtered[key] = null; });
    return filtered;
  }, [outlineIndexRequestState.errors, dismissedErrorKeys, localReindexError, localCourseLaunchErrors]);

  // --- Checklist/launch effects (replaces Redux dispatch-based effects) ---
  // Fetch best practices and launch data on course change
  useEffect(() => {
    getCourseBestPractices({ courseId, excludeGraded: true, all: true }).then((data) => {
      if (data) {
        setLocalChecklist(prev => ({ ...prev, ...getCourseBestPracticesChecklist(data) }));
      }
    }).catch(() => {});

    getCourseLaunch({ courseId, gradedOnly: true, validateOras: true, all: true })
      .then((data) => {
        setLocalIsSelfPaced(data.isSelfPaced);
        setLocalChecklist(prev => ({ ...prev, ...getCourseLaunchChecklist(data) }));
        setLocalCourseLaunchQueryStatus(RequestStatus.SUCCESSFUL);
        setLocalCourseLaunchErrors(null);
      }).catch((error) => {
        setLocalCourseLaunchQueryStatus(RequestStatus.FAILED);
        setLocalCourseLaunchErrors(getErrorDetails(error));
      });
  }, [courseId]);

  // Create discussions topics if course was created recently
  useEffect(() => {
    if (createdOn && moment(new Date(createdOn)).isAfter(moment().subtract(31, 'days'))) {
      createDiscussionsTopics(courseId).catch(() => {});
    }
  }, [createdOn, courseId]);

  // --- Reorder state (extracted hook) ---
  const {
    visibleSections,
    previewSections: previewSectionsCallback,
    cancelReorderPreview,
    commitSectionReorder,
    commitSubsectionReorder,
    commitUnitReorder,
    updateSectionOrderByIndex,
    updateSubsectionOrderByIndex,
    updateUnitOrderByIndex,
  } = useOutlineReorderState({ courseId, sections });

  // --- Selection state ---
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

  // --- Mutation methods (extracted hook) ---
  const {
    deleteCurrentSelection,
    duplicateCurrentSelection,
    configureCurrentSelection,
    pasteClipboardContent,
    updateHighlightsForCurrentSelection,
    enableHighlightsEmails,
    changeVideoSharingOption,
    dismissNotification: handleDismissNotification,
    dismissError,
    reindexCourse,
    setSavingStatus,
  } = useOutlineMutations({
    courseId,
    effectiveOutlineIndexData,
    queryClient,
    setLocalStatusBarOverride,
    setReindexLoadingStatus,
    setLocalReindexError,
    setSavingStatusState,
    setDismissedErrorKeys,
  });

  const context = useMemo<CourseOutlineStateContextData>(() => ({
    outlineIndexData: (effectiveOutlineIndexData || {}) as object,
    courseName: effectiveOutlineIndexData?.courseStructure?.displayName,
    courseUsageKey: effectiveOutlineIndexData?.courseStructure?.id || courseId,
    sections: visibleSections,
    updateSectionOrderByIndex,
    updateSubsectionOrderByIndex,
    updateUnitOrderByIndex,
    courseActions,
    statusBarData,
    savingStatus,
    errors: effectiveErrors,
    loadingStatus: effectiveLoadingStatus,
    isLoading: effectiveLoadingStatus.outlineIndexLoadingStatus === RequestStatus.IN_PROGRESS,
    isLoadingDenied: effectiveLoadingStatus.outlineIndexLoadingStatus === RequestStatus.DENIED,
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
    // PR 10: Mutation methods
    deleteCurrentSelection,
    duplicateCurrentSelection,
    configureCurrentSelection,
    pasteClipboardContent,
    updateHighlightsForCurrentSelection,
    enableHighlightsEmails,
    changeVideoSharingOption,
    dismissNotification: handleDismissNotification,
    dismissError,
    reindexCourse,
    setSavingStatus,
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
    effectiveErrors,
    effectiveLoadingStatus,
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
    // PR 10: Mutation methods
    deleteCurrentSelection,
    duplicateCurrentSelection,
    configureCurrentSelection,
    pasteClipboardContent,
    updateHighlightsForCurrentSelection,
    enableHighlightsEmails,
    changeVideoSharingOption,
    handleDismissNotification,
    dismissError,
    reindexCourse,
    setSavingStatus,
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
