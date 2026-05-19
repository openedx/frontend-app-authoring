import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type {
  OutlinePageErrors,
  SelectionState,
  XBlock,
  XBlockActions,
} from '@src/data/types';

import { useCourseItemData, useCourseOutlineSavingStatus, useCourseOutlineReindexStatus } from './data/apiHooks';

import { useToggle } from '@openedx/paragon';
import { useToggleWithValue } from '@src/hooks';
import { useOutlineReorderState } from './state/useOutlineReorderState';
import { useOutlineStatusState } from './state/useOutlineStatusState';
import {
  computeErrorSignature,
  filterDismissedErrors,
  pruneDismissedErrorSignatures,
} from './state/outlineErrorDismissal';
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

type CourseOutlineContextData = {
  outlineIndexData: LegacyCourseOutlineState['outlineIndexData'];
  courseName?: string;
  courseUsageKey: string;
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

  previewSections: (nextSections: XBlock[]) => void;
  cancelReorderPreview: () => void;
  commitSectionReorder: (sectionListIds: string[]) => Promise<void>;
  commitSubsectionReorder: (sectionId: string, prevSectionId: string, subsectionListIds: string[]) => Promise<void>;
  commitUnitReorder: (
    sectionId: string,
    prevSectionId: string,
    subsectionId: string,
    unitListIds: string[],
  ) => Promise<void>;

  dismissError: (key: string) => void;

  actionTargetSelection?: SelectionState;
  setActionTargetSelection: React.Dispatch<React.SetStateAction<SelectionState | undefined>>;
  isDeleteModalOpen: boolean;
  openDeleteModal: () => void;
  closeDeleteModal: () => void;
  isPublishModalOpen: boolean;
  currentPublishModalData?: ModalState;
  openPublishModal: (value: ModalState) => void;
  closePublishModal: () => void;
};

const CourseOutlineContext = createContext<CourseOutlineContextData | undefined>(undefined);

export const CourseOutlineProvider = ({ children }: { children?: React.ReactNode; }) => {
  const { courseId } = useCourseAuthoringContext();

  // Dismissed error signatures: { [errorKey]: signatureAtTimeOfDismissal }
  // Dismissal applies only while the current error's payload signature matches.
  const [dismissedErrorSignatures, setDismissedErrorSignatures] = useState<Record<string, string>>({});

  const {
    effectiveOutlineIndexData,
    sections,
    statusBarData,
    effectiveLoadingStatus,
    rawErrors,
    courseActions,
    isCustomRelativeDatesActive,
    enableProctoredExams,
    enableTimedExams,
    createdOn,
  } = useOutlineStatusState({
    courseId,
  });

  const savingStatus = useCourseOutlineSavingStatus(courseId);
  const { reindexLoadingStatus: derivedReindexLoadingStatus, reindexError } = useCourseOutlineReindexStatus(courseId);

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
    setCurrentSelection({
      currentId: containerId,
      subsectionId,
      sectionId,
      index,
    });
  }, []);

  // Preserve reference when no reindex error to avoid unnecessary effect re-fires.
  const mergedRawErrors = useMemo(() => {
    if (reindexError != null) {
      return { ...rawErrors, reindexApi: reindexError };
    }
    return rawErrors;
  }, [rawErrors, reindexError]);

  const mergedErrors = useMemo(() => {
    return filterDismissedErrors(mergedRawErrors, dismissedErrorSignatures, computeErrorSignature);
  }, [mergedRawErrors, dismissedErrorSignatures]);

  const mergedLoadingStatus = useMemo(() => ({
    ...effectiveLoadingStatus,
    reIndexLoadingStatus: derivedReindexLoadingStatus,
  }), [effectiveLoadingStatus, derivedReindexLoadingStatus]);

  // Drops entries where the error cleared or its payload changed,
  // so a new occurrence (even with the same payload) will show.
  useEffect(() => {
    setDismissedErrorSignatures(prev => {
      const pruned = pruneDismissedErrorSignatures(mergedRawErrors, prev);
      // Return prev (same reference) when pruned is semantically identical
      // to avoid React re-render loops from `pruneDismissedErrorSignatures`
      // always returning a new object literal.
      const prevKeys = Object.keys(prev);
      const prunedKeys = Object.keys(pruned);
      if (prevKeys.length === prunedKeys.length && prevKeys.every(k => prev[k] === pruned[k])) {
        return prev;
      }
      return pruned;
    });
  }, [mergedRawErrors]);

  // Dismiss error by storing a signature of the current error payload.
  // The error stays hidden only as long as the payload signature matches.
  const dismissError = useCallback((key: string) => {
    const currentError = mergedRawErrors[key];
    if (currentError == null) {
      return; // nothing to dismiss
    }
    const sig = computeErrorSignature(currentError);
    setDismissedErrorSignatures(prev => {
      if (prev[key] === sig) {
        return prev; // already dismissed with same signature
      }
      return { ...prev, [key]: sig };
    });
  }, [mergedRawErrors]);

  const [actionTargetSelection, setActionTargetSelection] = useState<SelectionState | undefined>();

  const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useToggle(false);
  const [
    isPublishModalOpen,
    currentPublishModalData,
    openPublishModal,
    closePublishModal,
  ] = useToggleWithValue<ModalState>();

  const context = useMemo<CourseOutlineContextData>(() => ({
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
    errors: mergedErrors,
    loadingStatus: mergedLoadingStatus,
    isLoading: mergedLoadingStatus.outlineIndexIsLoading,
    isLoadingDenied: mergedLoadingStatus.outlineIndexIsDenied,
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
    previewSections: previewSectionsCallback,
    cancelReorderPreview,
    commitSectionReorder,
    commitSubsectionReorder,
    commitUnitReorder,
    dismissError,
    actionTargetSelection,
    setActionTargetSelection,
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
    mergedErrors,
    mergedLoadingStatus,
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
    dismissError,
    actionTargetSelection,
    setActionTargetSelection,
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
    throw new Error('useCourseOutlineContext() was used in a component without a <CourseOutlineProvider> ancestor.');
  }
  return ctx;
}

export const CourseOutlineStateProvider = CourseOutlineProvider;
export const useCourseOutlineState = useCourseOutlineContext;
