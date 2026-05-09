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
import { useQueryClient } from '@tanstack/react-query';
import moment from 'moment';
import { getConfig } from '@edx/frontend-platform';

import { RequestStatus } from '@src/data/constants';
import { NOTIFICATION_MESSAGES } from '@src/constants';
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

  getSectionsList,
  getStatusBarData,
  getProctoredExamsFlag,
  getTimedExamsFlag,
} from './data/selectors';
import { replaceSectionInOutlineIndex, useCourseItemData, useReorderUnits } from './data/apiHooks';

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
  fetchStatusBarChecklistSuccess,
  fetchStatusBarSelfPacedSuccess,
  updateCourseLaunchQueryStatus,
} from './data/slice';
import {
  useDeleteCourseItem,
  useDuplicateItem,
  useConfigureSection,
  useConfigureSubsection,
  useConfigureUnit,
  usePasteItem,
  useReorderSections,
  useReorderSubsections,
  useUpdateCourseSectionHighlights,
} from './data/apiHooks';
import {
  enableCourseHighlightsEmails,
  setVideoSharingOption,
  dismissNotification,
  restartIndexingOnCourse,
  createDiscussionsTopics,
  getCourseLaunch,
  getCourseBestPractices,
} from './data/api';
import { getErrorDetails } from './utils/getErrorDetails';
import {
  getCourseBestPracticesChecklist,
  getCourseLaunchChecklist,
} from './utils/getChecklistForStatusBar';
import { showToastOutsideReact, closeToastOutsideReact } from '@src/generic/toast-context';
import { getBlockType } from '@src/generic/key-utils';

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

const CourseOutlineStateContext = createContext<CourseOutlineStateContextData | undefined>(undefined);

export const CourseOutlineStateProvider = ({ children }: { children?: React.ReactNode }) => {
  const dispatch = useDispatch();

  // Redux selectors for all state
  const outlineIndexData = useSelector(getOutlineIndexData);
  const sectionsList = useSelector(getSectionsList);
  const loadingStatus = useSelector(getLoadingStatus);
  const [savingStatus, setSavingStatusState] = useState('');
  const errors = useSelector(getErrors);
  const statusBarData = useSelector(getStatusBarData);
  const courseActions = useSelector(getCourseActions);
  const isCustomRelativeDatesActive = useSelector(getCustomRelativeDatesActiveFlag);
  const enableProctoredExams = useSelector(getProctoredExamsFlag);
  const enableTimedExams = useSelector(getTimedExamsFlag);
  const createdOn = useSelector(getCreatedOn);

  // Redux store reference for reading updated state in success callbacks
  // Query client for updating React Query cache after reorder
  const queryClient = useQueryClient();

  // Course ID from context (primary source)
  const { courseId } = useCourseAuthoringContext();

  // Whether Redux data belongs to current course (content-based guard).
  // With provider remount keyed by courseId, this is enough to block stale data
  // from previous course from leaking into initialData, effectiveOutlineIndexData,
  // or sectionsList fallback.
  const reduxDataMatchesCourse = outlineIndexData?.courseStructure?.id === courseId;

  // Mount outline index query from React Query (primary source).
  // Seed from Redux facade only when facade data matches current course.
  const outlineIndexQuery = useCourseOutlineIndex(courseId, {
    initialData: reduxDataMatchesCourse ? outlineIndexData : undefined,
  });

  const [dismissedErrorKeys, setDismissedErrorKeys] = useState<Set<string>>(new Set());
  const [reindexLoadingStatus, setReindexLoadingStatus] = useState<string>(RequestStatus.IN_PROGRESS);
  const [localStatusBarOverride, setLocalStatusBarOverride] = useState<Partial<CourseOutlineStatusBar>>({});

  // Derive outline-index loading/error state from live query so course switches
  // do not momentarily reuse stale Redux request status before sync effect runs.
  const outlineIndexRequestState = useMemo(() => getCourseOutlineIndexRequestState({
    isPending: outlineIndexQuery.isPending,
    isSuccess: outlineIndexQuery.isSuccess,
    error: outlineIndexQuery.error,
  }), [outlineIndexQuery.error, outlineIndexQuery.isPending, outlineIndexQuery.isSuccess]);
  const effectiveLoadingStatus = useMemo(() => ({
    ...loadingStatus,
    outlineIndexLoadingStatus: outlineIndexRequestState.status,
    reIndexLoadingStatus: reindexLoadingStatus,
  }), [loadingStatus, outlineIndexRequestState.status, reindexLoadingStatus]);
  const effectiveErrors = useMemo(() => {
    // Null out any dismissed error keys so they don't appear in the UI
    const filtered = { ...errors };
    dismissedErrorKeys.forEach(key => { filtered[key] = null; });
    return {
      ...filtered,
      outlineIndexApi: outlineIndexRequestState.errors,
    };
  }, [errors, dismissedErrorKeys, outlineIndexRequestState.errors]);

  // Effective outline data — prefer React Query cache, fall back to Redux facade.
  // Only fall back to Redux when its data matches the current course.
  const effectiveOutlineIndexData = outlineIndexQuery.data
    ?? (reduxDataMatchesCourse ? outlineIndexData : undefined);

  // Committed sections from query cache (PR 9: primary source), fall back to Redux sectionsList.
  // When query has resolved successfully, trust its data even if children array is empty.
  // When query is loading/error/idle and Redux has data for the current course, use it.
  // Otherwise show empty sections (prevent stale flash from a different course).
  const sections = outlineIndexQuery.isSuccess
    ? (effectiveOutlineIndexData?.courseStructure?.childInfo?.children || [])
    : reduxDataMatchesCourse ? (sectionsList || []) : [];

  // Sync query state to Redux loading status facade
  useEffect(() => {
    dispatch(updateOutlineIndexLoadingStatus(outlineIndexRequestState));
  }, [dispatch, outlineIndexRequestState]);
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

  // PR 11: Reorder sections mutation hook (declared before callbacks that use it)
  const reorderSectionsMutation = useReorderSections(courseId);

  // PR 12: Reorder subsections mutation hook
  const reorderSubsectionsMutation = useReorderSubsections(courseId);

  // PR 13: Reorder units mutation hook
  const reorderUnitsMutation = useReorderUnits(courseId);

  // Commit section reorder — keeps preview visible until request settles
  const commitSectionReorder = useCallback(async (sectionListIds: string[]) => {
    if (!courseId) {
      return;
    }

    captureOriginalSections();
    try {
      await reorderSectionsMutation.mutateAsync(sectionListIds);
      acceptReorderAndSyncSectionOrder(sectionListIds);
    } catch {
      rollbackReorderPreview();
    }
  }, [courseId, reorderSectionsMutation, captureOriginalSections, acceptReorderAndSyncSectionOrder, rollbackReorderPreview]);

  // Commit subsection reorder
  const commitSubsectionReorder = useCallback(async (
    sectionId: string,
    prevSectionId: string,
    subsectionListIds: string[],
  ) => {
    captureOriginalSections();
    try {
      await reorderSubsectionsMutation.mutateAsync({ sectionId, prevSectionId, subsectionListIds });
      acceptReorderPreview();
    } catch {
      rollbackReorderPreview();
    }
  }, [reorderSubsectionsMutation, captureOriginalSections, acceptReorderPreview, rollbackReorderPreview]);

  // Commit unit reorder
  const commitUnitReorder = useCallback(async (
    sectionId: string,
    prevSectionId: string,
    subsectionId: string,
    unitListIds: string[],
  ) => {
    captureOriginalSections();
    try {
      await reorderUnitsMutation.mutateAsync({ sectionId, prevSectionId, subsectionId, unitListIds });
      acceptReorderPreview();
    } catch {
      rollbackReorderPreview();
    }
  }, [reorderUnitsMutation, captureOriginalSections, acceptReorderPreview, rollbackReorderPreview]);

  const updateSectionOrderByIndex = useCallback(async (currentIndex: number, newIndex: number) => {
    if (!courseId || currentIndex === newIndex) {
      return;
    }

    const previousSections = visibleSections;
    previousSectionsRef.current = previousSections;
    const nextSections = arrayMove(visibleSections, currentIndex, newIndex) as XBlock[];
    const sectionListIds = nextSections.map((section) => section.id);
    setPreviewSections(nextSections);

    try {
      await reorderSectionsMutation.mutateAsync(sectionListIds);
      acceptReorderAndSyncSectionOrder(sectionListIds);
    } catch {
      rollbackReorderPreview();
    }
  }, [visibleSections, courseId, reorderSectionsMutation, rollbackReorderPreview, acceptReorderAndSyncSectionOrder]);

  const updateSubsectionOrderByIndex = useCallback(async (section: XBlock, moveDetails) => {
    const { fn, args, sectionId } = moveDetails;
    if (!args) {
      return;
    }

    const previousSections = visibleSections;
    previousSectionsRef.current = previousSections;
    const [sectionsCopy, newSubsections] = fn(...args);
    if (newSubsections && sectionId) {
      setPreviewSections(sectionsCopy);
      try {
        await reorderSubsectionsMutation.mutateAsync({
          sectionId,
          prevSectionId: section.id,
          subsectionListIds: newSubsections.map((subsection: XBlock) => subsection.id),
        });
        acceptReorderPreview();
      } catch {
        rollbackReorderPreview();
      }
    }
  }, [visibleSections, reorderSubsectionsMutation, rollbackReorderPreview, acceptReorderPreview]);

  const updateUnitOrderByIndex = useCallback(async (section: XBlock, moveDetails) => {
    const { fn, args, sectionId, subsectionId } = moveDetails;
    if (!args) {
      return;
    }

    const previousSections = visibleSections;
    previousSectionsRef.current = previousSections;
    const [sectionsCopy, newUnits] = fn(...args);
    if (newUnits && subsectionId) {
      setPreviewSections(sectionsCopy);
      try {
        await reorderUnitsMutation.mutateAsync({
          sectionId,
          prevSectionId: section.id,
          subsectionId,
          unitListIds: newUnits.map((unit: XBlock) => unit.id),
        });
        acceptReorderPreview();
      } catch {
        rollbackReorderPreview();
      }
    }
  }, [visibleSections, reorderUnitsMutation, rollbackReorderPreview, acceptReorderPreview]);

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

  // --- PR 10: Mutation hooks ---
  const deleteMutation = useDeleteCourseItem();
  const { mutate: duplicateItem } = useDuplicateItem(courseId);
  const { mutate: configureSection } = useConfigureSection();
  const { mutate: configureSubsection } = useConfigureSubsection();
  const { mutate: configureUnit } = useConfigureUnit();
  const { mutate: pasteItem } = usePasteItem(courseId);
  const { mutate: updateSectionHighlights } = useUpdateCourseSectionHighlights();



  // --- PR 10: Mutation methods ---

  // Pure helpers to remove items from outline tree at each level
  const removeSectionFromTree = (children: any[], sectionId: string): any[] =>
    children.filter((s: any) => s.id !== sectionId);

  const removeSubsectionFromTree = (children: any[], sectionId: string, subsectionId: string): any[] =>
    children.map((s: any) => {
      if (s.id !== sectionId) return s;
      return {
        ...s,
        childInfo: {
          ...s.childInfo,
          children: (s.childInfo?.children || []).filter((sub: any) => sub.id !== subsectionId),
        },
      };
    });

  const removeUnitFromTree = (
    children: any[], sectionId: string, subsectionId: string, unitId: string,
  ): any[] =>
    children.map((s: any) => {
      if (s.id !== sectionId) return s;
      return {
        ...s,
        childInfo: {
          ...s.childInfo,
          children: (s.childInfo?.children || []).map((sub: any) => {
            if (sub.id !== subsectionId) return sub;
            return {
              ...sub,
              childInfo: {
                ...sub.childInfo,
                children: (sub.childInfo?.children || []).filter((u: any) => u.id !== unitId),
              },
            };
          }),
        },
      };
    });

  // Helper: apply outline index cache update with null guards
  const updateOutlineIndexCache = (updater: (old: any) => any) => {
    queryClient.setQueryData(courseOutlineIndexQueryKey(courseId), (old: any) => {
      if (!old?.courseStructure?.childInfo?.children) return old;
      return updater(old);
    });
  };

  const deleteCurrentSelection = useCallback(async (selection: SelectionState) => {
    if (!selection?.currentId) {
      return;
    }
    const category = getBlockType(selection.currentId);
    switch (category) {
      case 'chapter':
        await deleteMutation.mutateAsync(
          { itemId: selection.currentId },
        );
        // Remove section from outline index cache
        updateOutlineIndexCache((old) => ({
          ...old,
          courseStructure: {
            ...old.courseStructure,
            childInfo: {
              ...old.courseStructure.childInfo,
              children: removeSectionFromTree(
                old.courseStructure.childInfo.children, selection.currentId,
              ),
            },
          },
        }));
        break;
      case 'sequential':
        await deleteMutation.mutateAsync(
          { itemId: selection.currentId, sectionId: selection.sectionId },
        );
        // Remove subsection from outline index cache
        updateOutlineIndexCache((old) => ({
          ...old,
          courseStructure: {
            ...old.courseStructure,
            childInfo: {
              ...old.courseStructure.childInfo,
              children: removeSubsectionFromTree(
                old.courseStructure.childInfo.children,
                selection.sectionId!,
                selection.currentId,
              ),
            },
          },
        }));
        break;
      case 'vertical':
        await deleteMutation.mutateAsync(
          {
            itemId: selection.currentId,
            subsectionId: selection.subsectionId,
            sectionId: selection.sectionId,
          },
        );
        // Remove unit from outline index cache
        updateOutlineIndexCache((old) => ({
          ...old,
          courseStructure: {
            ...old.courseStructure,
            childInfo: {
              ...old.courseStructure.childInfo,
              children: removeUnitFromTree(
                old.courseStructure.childInfo.children,
                selection.sectionId!,
                selection.subsectionId!,
                selection.currentId,
              ),
            },
          },
        }));
        break;
      default:
        throw new Error(`Unrecognized category ${category}`);
    }
  }, [deleteMutation, queryClient, courseId]);

  const duplicateCurrentSelection = useCallback((selection: SelectionState) => {
    if (!selection?.currentId) {
      return;
    }
    const category = getBlockType(selection.currentId);
    let parentId: string | undefined;
    if (category === 'chapter') {
      parentId = effectiveOutlineIndexData?.courseStructure?.id || courseId;
    } else if (category === 'sequential') {
      parentId = selection.sectionId;
    } else if (category === 'vertical') {
      parentId = selection.subsectionId;
    }
    if (parentId) {
      duplicateItem({
        itemId: selection.currentId,
        parentId,
        sectionId: selection.sectionId,
        subsectionId: selection.subsectionId,
      });
    }
  }, [duplicateItem, effectiveOutlineIndexData, queryClient, courseId]);

  const configureCurrentSelection = useCallback((selection: SelectionState, variables: any) => {
    if (!selection?.currentId) {
      return;
    }
    const category = getBlockType(selection.currentId);
    switch (category) {
      case 'chapter':
        configureSection({ sectionId: selection.sectionId, ...variables });
        break;
      case 'sequential':
        configureSubsection({ itemId: selection.currentId, sectionId: selection.sectionId, ...variables });
        break;
      case 'vertical':
        configureUnit({ unitId: selection.currentId, sectionId: selection.sectionId, ...variables });
        break;
      default:
        throw new Error('Unsupported block type');
    }
  }, [configureSection, configureSubsection, configureUnit]);

  const pasteClipboardContent = useCallback((parentLocator: string, subsectionId?: string, sectionId?: string) => {
    pasteItem({ parentLocator, subsectionId, sectionId });
  }, [pasteItem]);

  const updateHighlightsForCurrentSelection = useCallback((
    selection: SelectionState,
    highlights: Record<string, string | false>,
  ) => {
    if (!selection?.currentId) {
      return;
    }
    const dataToSend = Object.values(highlights).filter(Boolean) as string[];
    updateSectionHighlights({ sectionId: selection.currentId, highlights: dataToSend });
  }, [updateSectionHighlights]);

  const enableHighlightsEmails = useCallback(async () => {
    setSavingStatusState(RequestStatus.PENDING);
    showToastOutsideReact(NOTIFICATION_MESSAGES.saving);
    try {
      await enableCourseHighlightsEmails(courseId);
      queryClient.invalidateQueries({ queryKey: courseOutlineIndexQueryKey(courseId) });
      setSavingStatusState(RequestStatus.SUCCESSFUL);
    } catch {
      setSavingStatusState(RequestStatus.FAILED);
    } finally {
      closeToastOutsideReact();
    }
  }, [courseId, queryClient]);

  const changeVideoSharingOption = useCallback(async (value: string) => {
    setSavingStatusState(RequestStatus.PENDING);
    showToastOutsideReact(NOTIFICATION_MESSAGES.saving);
    try {
      await setVideoSharingOption(courseId, value);
      setLocalStatusBarOverride({ videoSharingOptions: value });
      setSavingStatusState(RequestStatus.SUCCESSFUL);
    } catch {
      setSavingStatusState(RequestStatus.FAILED);
    } finally {
      closeToastOutsideReact();
    }
  }, [courseId]);

  const handleDismissNotification = useCallback(async () => {
    const dismissUrl = effectiveOutlineIndexData?.notificationDismissUrl;
    if (!dismissUrl) {
      return;
    }
    const url = `${getConfig().STUDIO_BASE_URL}${dismissUrl}`;
    setSavingStatusState(RequestStatus.PENDING);
    try {
      await dismissNotification(url);
      setSavingStatusState(RequestStatus.SUCCESSFUL);
    } catch {
      setSavingStatusState(RequestStatus.FAILED);
    }
  }, [effectiveOutlineIndexData]);

  const dismissError = useCallback((key: string) => {
    setDismissedErrorKeys(prev => new Set([...prev, key]));
  }, []);

  const reindexCourse = useCallback(async () => {
    const link = effectiveOutlineIndexData?.reindexLink;
    if (!link) {
      return;
    }
    setReindexLoadingStatus(RequestStatus.IN_PROGRESS);
    try {
      await restartIndexingOnCourse(link);
      setReindexLoadingStatus(RequestStatus.SUCCESSFUL);
    } catch (error) {
      setReindexLoadingStatus(RequestStatus.FAILED);
    }
  }, [effectiveOutlineIndexData]);

  const setSavingStatus = useCallback((status: string) => {
    setSavingStatusState(status);
  }, []);

  // Mount effects moved from hooks.jsx (PR 10)
  useEffect(() => {
    getCourseBestPractices({ courseId, excludeGraded: true, all: true }).then((data) => {
      if (data) {
        dispatch(fetchStatusBarChecklistSuccess(getCourseBestPracticesChecklist(data)));
      }
    }).catch(() => {});

    getCourseLaunch({ courseId, gradedOnly: true, validateOras: true, all: true })
      .then((data) => {
        dispatch(fetchStatusBarSelfPacedSuccess({ isSelfPaced: data.isSelfPaced }));
        dispatch(fetchStatusBarChecklistSuccess(getCourseLaunchChecklist(data)));
        dispatch(updateCourseLaunchQueryStatus({ status: RequestStatus.SUCCESSFUL }));
      }).catch((error) => {
        dispatch(updateCourseLaunchQueryStatus({
          status: RequestStatus.FAILED,
          errors: getErrorDetails(error),
        }));
      });
  }, [courseId, dispatch]);

  useEffect(() => {
    if (createdOn && moment(new Date(createdOn)).isAfter(moment().subtract(31, 'days'))) {
      createDiscussionsTopics(courseId).catch(() => {});
    }
  }, [createdOn, courseId]);

  const context = useMemo<CourseOutlineStateContextData>(() => ({
    outlineIndexData: effectiveOutlineIndexData,
    courseName: effectiveOutlineIndexData?.courseStructure?.displayName,
    courseUsageKey: effectiveOutlineIndexData?.courseStructure?.id || courseId,
    sections: visibleSections,
    updateSectionOrderByIndex,
    updateSubsectionOrderByIndex,
    updateUnitOrderByIndex,
    courseActions,
    statusBarData: { ...statusBarData, ...localStatusBarOverride },
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
    localStatusBarOverride,
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
