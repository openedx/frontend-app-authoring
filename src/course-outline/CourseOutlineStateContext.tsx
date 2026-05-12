import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { RequestStatus } from '@src/data/constants';
import type {
  OutlinePageErrors,
  SelectionState,
  XBlock,
  XBlockActions,
} from '@src/data/types';
import { useCourseItemData, useCreateCourseBlock } from './data/apiHooks';

import { useOutlineMutations } from './state/useOutlineMutations';
import { useOutlineReorderState } from './state/useOutlineReorderState';
import { useOutlineStatusState } from './state/useOutlineStatusState';
import useOutlineAddBlockActions from './state/useOutlineAddBlockActions';
import useOutlineModalState from './state/useOutlineModalState';
import useOutlineActionTargetState from './state/useOutlineActionTargetState';
import { buildSelectionState } from './state/selection';
import {
  EditableSubsection,
  getLastEditableItem,
  getLastEditableSubsection,
} from './state/editability';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import type { ModalState } from '@src/CourseAuthoringContext';

import {
  CourseOutlineState as LegacyCourseOutlineState,
  CourseOutlineStatusBar,
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

  // Add-block mutation handlers
  handleAddBlock: ReturnType<typeof useCreateCourseBlock>;
  handleAddAndOpenUnit: ReturnType<typeof useCreateCourseBlock>;
  // Action/menu target selection (separate from sidebar/card selection)
  actionTargetSelection?: SelectionState;
  setActionTargetSelection: React.Dispatch<React.SetStateAction<SelectionState | undefined>>;
  // Modal state
  isDeleteModalOpen: boolean;
  openDeleteModal: () => void;
  closeDeleteModal: () => void;
  isPublishModalOpen: boolean;
  currentPublishModalData?: ModalState;
  openPublishModal: (value: ModalState) => void;
  closePublishModal: () => void;
};



const CourseOutlineStateContext = createContext<CourseOutlineStateContextData | undefined>(undefined);

export const CourseOutlineProvider = ({ children }: { children?: React.ReactNode }) => {
  // Query client for updating React Query cache after reorder
  const queryClient = useQueryClient();

  // Course ID from context (primary source)
  const { courseId, openUnitPage } = useCourseAuthoringContext();

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

  // --- Status/query state (extracted hook) ---
  const {
    effectiveOutlineIndexData,
    sections,
    statusBarData,
    effectiveLoadingStatus,
    effectiveErrors,
    courseActions,
    isCustomRelativeDatesActive,
    enableProctoredExams,
    enableTimedExams,
    createdOn,
  } = useOutlineStatusState({
    courseId,
    reindexLoadingStatus,
    localStatusBarOverride,
    dismissedErrorKeys,
    localReindexError,
  });

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

  // --- Add-block actions (extracted hook) ---
  const {
    handleAddBlock,
    handleAddAndOpenUnit,
  } = useOutlineAddBlockActions({ courseId, openUnitPage });

  // --- Action target selection (extracted hook) ---
  const {
    actionTargetSelection,
    setActionTargetSelection,
  } = useOutlineActionTargetState();

  // --- Modal state (extracted hook) ---
  const {
    isDeleteModalOpen,
    openDeleteModal,
    closeDeleteModal,
    isPublishModalOpen,
    currentPublishModalData,
    openPublishModal,
    closePublishModal,
  } = useOutlineModalState();

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
    // Add-block mutation handlers
    handleAddBlock,
    handleAddAndOpenUnit,
    // Action/menu target selection
    actionTargetSelection,
    setActionTargetSelection,
    // Modal state
    isDeleteModalOpen,
    openDeleteModal,
    closeDeleteModal,
    isPublishModalOpen,
    currentPublishModalData,
    openPublishModal,
    closePublishModal,
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
    // Add-block mutation handlers
    handleAddBlock,
    handleAddAndOpenUnit,
    // Action/menu target selection
    actionTargetSelection,
    setActionTargetSelection,
    // Modal state
    isDeleteModalOpen,
    openDeleteModal,
    closeDeleteModal,
    isPublishModalOpen,
    currentPublishModalData,
    openPublishModal,
    closePublishModal,
  ]);

  return (
    <CourseOutlineStateContext.Provider value={context}>
      {children}
    </CourseOutlineStateContext.Provider>
  );
};

export function useCourseOutlineContext(): CourseOutlineStateContextData {
  const ctx = useContext(CourseOutlineStateContext);
  if (ctx === undefined) {
    throw new Error('useCourseOutlineContext() was used in a component without a <CourseOutlineProvider> ancestor.');
  }
  return ctx;
}

// Compatibility aliases for gradual migration
export const CourseOutlineStateProvider = CourseOutlineProvider;
export const useCourseOutlineState = useCourseOutlineContext;
