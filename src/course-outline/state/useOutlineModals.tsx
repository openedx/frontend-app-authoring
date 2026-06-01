import { useState, useCallback } from 'react';

import { useToggle } from '@openedx/paragon';
import { getBlockType } from '@src/generic/key-utils';
import type { SelectionState, XBlock } from '@src/data/types';
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
  handleOpenConfigureModal: (selection: SelectionState) => void;
  openDeleteModal: (payload: SelectionState) => void;
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
  const [highlightsModalData, setHighlightsModalData] = useState<SelectionState | undefined>();
  const [configureModalData, setConfigureModalData] = useState<SelectionState | undefined>();

  // ─── Data for configure modal ────────────────────────────────────────────
  const { data: configureItemData } = useCourseItemData(
    isConfigureModalOpen ? configureModalData?.currentId : undefined,
  );

  // ─── Derived values ──────────────────────────────────────────────────────
  const configureItemCategory = configureItemData?.category || '';
  const isOverflowVisible = configureItemCategory === COURSE_BLOCK_NAMES.chapter.id;
  const deleteItemCategory = deleteModalData?.currentId ? getBlockType(deleteModalData.currentId) : '';
  const itemCategoryName = COURSE_BLOCK_NAMES[deleteItemCategory]?.name.toLowerCase();
  const unlinkItemCategory = currentUnlinkModalData?.value?.id ? getBlockType(currentUnlinkModalData.value.id) : '';

  // ─── Event handlers ──────────────────────────────────────────────────────
  const handleEnableHighlightsSubmit = useCallback(() => {
    enableHighlightsEmailsMutation.mutate();
    closeEnableHighlightsModal();
  }, [enableHighlightsEmailsMutation]);

  const handleOpenHighlightsModal = useCallback((section: XBlock) => {
    const payload: SelectionState = {
      currentId: section.id,
      sectionId: section.id,
    };
    setHighlightsModalData(payload);
    openHighlightsModal();
  }, []);

  const handleHighlightsFormSubmit = useCallback((highlights) => {
    if (!highlightsModalData?.currentId) { return; }
    const dataToSend = Object.values(highlights).filter(Boolean) as string[];
    highlightsMutation.mutate({ sectionId: highlightsModalData.currentId, highlights: dataToSend });
    closeHighlightsModal();
    setHighlightsModalData(undefined);
  }, [highlightsModalData, highlightsMutation]);

  const handleConfigureModalClose = useCallback(() => {
    closeConfigureModal();
    setConfigureModalData(undefined);
  }, []);

  const handleOpenConfigureModal = useCallback((selection: SelectionState) => {
    setConfigureModalData(selection);
    openConfigureModal();
  }, []);

  const handleConfigureItemSubmitWrapper = useCallback((variables) => {
    if (configureModalData) {
      handleConfigureItemSubmit(configureModalData, variables);
    }
    handleConfigureModalClose();
  }, [configureModalData, handleConfigureItemSubmit]);

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
    if (!deleteModalData?.currentId) { return; }
    const success = await handleDeleteItemSubmit(deleteModalData);
    if (success) {
      closeDeleteModal();
      if (currentSelection?.currentId === deleteModalData?.currentId) {
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
      highlightsModalData={highlightsModalData}
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
