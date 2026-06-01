import { useState, useCallback } from 'react';

import { useToggle } from '@openedx/paragon';
import { getBlockType } from '@src/generic/key-utils';
import type { OutlineActionSelection, XBlock } from '@src/data/types';
import type {
  ChapterConfigurePayload,
  ConfigureItemPayload,
  SequentialConfigurePayload,
  UnitConfigurePayload,
} from '../data/types';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { useCourseOutlineContext } from '../CourseOutlineContext';
import {
  useCourseItemData,
  useUpdateCourseSectionHighlights,
  useEnableCourseHighlightsEmails,
} from '../data/apiHooks';
import { useUnlinkDownstream } from '@src/generic/unlink-modal';
import { useOutlineActions } from './useOutlineActions';
import { COURSE_BLOCK_NAMES } from '../constants';
import OutlineModals from '../OutlineModals';

export interface UseOutlineModalsReturn {
  openEnableHighlightsModal: () => void;
  handleOpenHighlightsModal: (section: XBlock) => void;
  handleOpenConfigureModal: (selection: OutlineActionSelection) => void;
  openDeleteModal: (payload: OutlineActionSelection) => void;
  modals: React.JSX.Element;
}

export function useOutlineModals(courseId: string): UseOutlineModalsReturn {
  const {
    deleteModalData,
    isDeleteModalOpen,
    closeDeleteModal,
    openDeleteModal,
    currentSelection,
    clearSelection,
    enableProctoredExams,
    enableTimedExams,
    statusBarData,
  } = useCourseOutlineContext();
  const {
    isUnlinkModalOpen,
    currentUnlinkModalData,
    closeUnlinkModal,
  } = useCourseAuthoringContext();

  const { handleDeleteItemSubmit, handleConfigureItemSubmit } = useOutlineActions(courseId);
  const highlightsMutation = useUpdateCourseSectionHighlights(courseId);
  const enableHighlightsEmailsMutation = useEnableCourseHighlightsEmails(courseId);
  const { mutateAsync: unlinkDownstream } = useUnlinkDownstream();

  // ─── Modal state ─────────────────────────────────────────────────────────
  const [isEnableHighlightsModalOpen, openEnableHighlightsModal, closeEnableHighlightsModal] = useToggle(false);
  const [isHighlightsModalOpen, openHighlightsModal, closeHighlightsModal] = useToggle(false);
  const [isConfigureModalOpen, openConfigureModal, closeConfigureModal] = useToggle(false);
  const [highlightsModalData, setHighlightsModalData] = useState<string | undefined>();
  const [configureModalData, setConfigureModalData] = useState<OutlineActionSelection | undefined>();

  // ─── Data for configure modal ────────────────────────────────────────────
  const { data: configureItemData } = useCourseItemData(
    isConfigureModalOpen ? configureModalData?.currentId : undefined,
  );

  // ─── Derived values ──────────────────────────────────────────────────────
  const configureItemCategory = configureItemData?.category || '';
  const isOverflowVisible = configureItemCategory === COURSE_BLOCK_NAMES.chapter.id;
  const deleteItemCategory = deleteModalData?.category ?? '';
  const itemCategoryName = COURSE_BLOCK_NAMES[deleteItemCategory]?.name.toLowerCase();
  const unlinkItemCategory = currentUnlinkModalData?.value?.id ? getBlockType(currentUnlinkModalData.value.id) : '';

  // ─── Event handlers ──────────────────────────────────────────────────────
  const handleEnableHighlightsSubmit = useCallback(() => {
    enableHighlightsEmailsMutation.mutate();
    closeEnableHighlightsModal();
  }, [enableHighlightsEmailsMutation]);

  const handleOpenHighlightsModal = useCallback((section: XBlock) => {
    setHighlightsModalData(section.id);
    openHighlightsModal();
  }, []);

  const handleHighlightsFormSubmit = useCallback((highlights) => {
    if (!highlightsModalData) { return; }
    const dataToSend = Object.values(highlights).filter(Boolean) as string[];
    highlightsMutation.mutate({ sectionId: highlightsModalData, highlights: dataToSend });
    closeHighlightsModal();
    setHighlightsModalData(undefined);
  }, [highlightsModalData, highlightsMutation]);

  const handleConfigureModalClose = useCallback(() => {
    closeConfigureModal();
    setConfigureModalData(undefined);
  }, []);

  const handleOpenConfigureModal = useCallback((selection: OutlineActionSelection) => {
    setConfigureModalData(selection);
    openConfigureModal();
  }, []);

  const handleConfigureItemSubmitWrapper = useCallback(async (variables: Record<string, unknown>) => {
    if (!configureModalData) {
      handleConfigureModalClose();
      return;
    }
    let payload: ConfigureItemPayload;
    const { category } = configureModalData;
    switch (category) {
      case 'chapter':
        payload = {
          category: 'chapter',
          sectionId: configureModalData.sectionId,
          ...variables,
        } as ChapterConfigurePayload;
        break;
      case 'sequential':
        payload = {
          category: 'sequential',
          itemId: configureModalData.currentId,
          sectionId: configureModalData.sectionId,
          ...variables,
        } as SequentialConfigurePayload;
        break;
      case 'vertical':
        payload = {
          category: 'vertical',
          unitId: configureModalData.currentId,
          sectionId: configureModalData.sectionId,
          ...variables,
        } as UnitConfigurePayload;
        break;
      default:
        handleConfigureModalClose();
        return;
    }
    const success = await handleConfigureItemSubmit(payload);
    if (success) {
      handleConfigureModalClose();
    }
    // On failure, keep modal open and configureModalData intact
    // so the user can retry or inspect the error.
  }, [configureModalData, handleConfigureItemSubmit, handleConfigureModalClose]);

  const handleUnlinkItemSubmit = useCallback(async () => {
    if (!currentUnlinkModalData) { return; }
    await unlinkDownstream({
      downstreamBlockId: currentUnlinkModalData.value!.id,
      sectionId: currentUnlinkModalData.sectionId,
      subsectionId: currentUnlinkModalData.subsectionId,
    }, {
      onSuccess: () => { closeUnlinkModal(); },
    });
  }, [currentUnlinkModalData, unlinkDownstream, closeUnlinkModal]);

  const onDeleteConfirm = useCallback(async () => {
    if (!deleteModalData) { return; }
    const success = await handleDeleteItemSubmit(deleteModalData);
    if (success) {
      closeDeleteModal();
      if (currentSelection?.currentId === deleteModalData.currentId) {
        clearSelection();
      }
    }
  }, [deleteModalData, handleDeleteItemSubmit, closeDeleteModal, currentSelection, clearSelection]);

  // ─── Rendered modals ─────────────────────────────────────────────────────
  const modals = (
    <OutlineModals
      isEnableHighlightsModalOpen={isEnableHighlightsModalOpen}
      closeEnableHighlightsModal={closeEnableHighlightsModal}
      handleEnableHighlightsSubmit={handleEnableHighlightsSubmit}
      isHighlightsModalOpen={isHighlightsModalOpen}
      closeHighlightsModal={closeHighlightsModal}
      handleHighlightsFormSubmit={handleHighlightsFormSubmit}
      highlightsModalCurrentId={highlightsModalData}
      isConfigureModalOpen={isConfigureModalOpen}
      handleConfigureModalClose={handleConfigureModalClose}
      handleConfigureItemSubmitWrapper={handleConfigureItemSubmitWrapper}
      isOverflowVisible={isOverflowVisible}
      currentItemData={configureItemData as XBlock | undefined}
      enableProctoredExams={enableProctoredExams}
      enableTimedExams={enableTimedExams}
      isSelfPaced={statusBarData?.isSelfPaced ?? false}
      itemCategoryName={itemCategoryName}
      isDeleteModalOpen={isDeleteModalOpen}
      closeDeleteModal={closeDeleteModal}
      onDeleteConfirm={onDeleteConfirm}
      isUnlinkModalOpen={isUnlinkModalOpen}
      closeUnlinkModal={closeUnlinkModal}
      handleUnlinkItemSubmit={handleUnlinkItemSubmit}
      displayName={currentUnlinkModalData?.value?.displayName}
      itemCategory={unlinkItemCategory}
    />
  );

  return {
    openEnableHighlightsModal,
    handleOpenHighlightsModal,
    handleOpenConfigureModal,
    openDeleteModal,
    modals,
  };
}
