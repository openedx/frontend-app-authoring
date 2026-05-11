import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getConfig } from '@edx/frontend-platform';

import { RequestStatus } from '@src/data/constants';
import { NOTIFICATION_MESSAGES } from '@src/constants';
import type { SelectionState } from '@src/data/types';
import {
  useDeleteCourseItem,
  useDuplicateItem,
  useConfigureSection,
  useConfigureSubsection,
  useConfigureUnit,
  usePasteItem,
  useUpdateCourseSectionHighlights,
} from '../data/apiHooks';
import {
  enableCourseHighlightsEmails,
  setVideoSharingOption,
  dismissNotification,
  restartIndexingOnCourse,
} from '../data/api';
import { getErrorDetails } from '../utils/getErrorDetails';
import { showToastOutsideReact, closeToastOutsideReact } from '@src/generic/toast-context';
import { getBlockType } from '@src/generic/key-utils';
import { courseOutlineIndexQueryKey } from '../data/outlineIndexQuery';

interface UseOutlineMutationsInput {
  courseId: string;
  effectiveOutlineIndexData: any;
  queryClient: ReturnType<typeof useQueryClient>;
  setLocalStatusBarOverride: (override: any) => void;
  setReindexLoadingStatus: (status: string) => void;
  setLocalReindexError: (error: any) => void;
  setSavingStatusState: (status: string) => void;
  setDismissedErrorKeys: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export interface UseOutlineMutationsOutput {
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
}

export function useOutlineMutations({
  courseId,
  effectiveOutlineIndexData,
  queryClient,
  setLocalStatusBarOverride,
  setReindexLoadingStatus,
  setLocalReindexError,
  setSavingStatusState,
  setDismissedErrorKeys,
}: UseOutlineMutationsInput): UseOutlineMutationsOutput {
  // --- Mutation hooks ---
  const deleteMutation = useDeleteCourseItem();
  const { mutate: duplicateItem } = useDuplicateItem(courseId);
  const { mutate: configureSection } = useConfigureSection();
  const { mutate: configureSubsection } = useConfigureSubsection();
  const { mutate: configureUnit } = useConfigureUnit();
  const { mutate: pasteItem } = usePasteItem(courseId);
  const { mutate: updateSectionHighlights } = useUpdateCourseSectionHighlights();

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
  }, [courseId, queryClient, setSavingStatusState]);

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
  }, [courseId, setLocalStatusBarOverride, setSavingStatusState]);

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
  }, [effectiveOutlineIndexData, setSavingStatusState]);

  const dismissError = useCallback((key: string) => {
    setDismissedErrorKeys(prev => new Set([...prev, key]));
  }, [setDismissedErrorKeys]);

  const reindexCourse = useCallback(async () => {
    const link = effectiveOutlineIndexData?.reindexLink;
    if (!link) {
      return;
    }
    setLocalReindexError(null);
    setReindexLoadingStatus(RequestStatus.IN_PROGRESS);
    try {
      await restartIndexingOnCourse(link);
      setReindexLoadingStatus(RequestStatus.SUCCESSFUL);
    } catch (error) {
      setLocalReindexError(getErrorDetails(error));
      setReindexLoadingStatus(RequestStatus.FAILED);
    }
  }, [effectiveOutlineIndexData, setLocalReindexError, setReindexLoadingStatus]);

  const setSavingStatus = useCallback((status: string) => {
    setSavingStatusState(status);
  }, [setSavingStatusState]);

  return {
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
  };
}
