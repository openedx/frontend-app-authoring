import React from 'react';
import DeleteModal from '@src/generic/delete-modal/DeleteModal';
import ConfigureModal from '@src/generic/configure-modal/ConfigureModal';
import { UnlinkModal } from '@src/generic/unlink-modal';

import EnableHighlightsModal from './enable-highlights-modal/EnableHighlightsModal';
import HighlightsModal from './highlights-modal/HighlightsModal';
import PublishModal from './publish-modal/PublishModal';

import { useCourseOutlineContext } from './CourseOutlineContext';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { useDeleteModal } from './state/useDeleteModal';
import { useUnlinkModal } from './state/useUnlinkModal';
import { COURSE_BLOCK_NAMES } from './constants';
import type { XBlock } from '@src/data/types';
import type { HighlightData } from './highlights-modal/HighlightsModal';

export interface OutlineModalsProps {
  // Highlights modal
  isEnableHighlightsModalOpen: boolean;
  closeEnableHighlightsModal: () => void;
  handleEnableHighlightsSubmit: () => void;
  isHighlightsModalOpen: boolean;
  closeHighlightsModal: () => void;
  handleHighlightsFormSubmit: (highlights: HighlightData) => void;
  highlightsModalCurrentId: string | undefined;
  // Configure modal
  isConfigureModalOpen: boolean;
  handleConfigureModalClose: () => void;
  handleConfigureItemSubmitWrapper: (variables: Record<string, unknown>) => Promise<void>;
  isOverflowVisible: boolean;
  configureItemData: XBlock | undefined;
}

/**
 * Renders all course-outline modal dialogs.
 * Receives highlights/configure props; reads delete/publish state from context
 * and calls delete/unlink sub-hooks directly.
 */
const OutlineModals: React.FC<OutlineModalsProps> = ({
  isEnableHighlightsModalOpen,
  closeEnableHighlightsModal,
  handleEnableHighlightsSubmit,
  isHighlightsModalOpen,
  closeHighlightsModal,
  handleHighlightsFormSubmit,
  highlightsModalCurrentId,
  isConfigureModalOpen,
  handleConfigureModalClose,
  handleConfigureItemSubmitWrapper,
  isOverflowVisible,
  configureItemData,
}) => {
  const {
    enableProctoredExams,
    enableTimedExams,
    statusBarData,
    isDeleteModalOpen,
    closeDeleteModal,
    deleteModalData,
  } = useCourseOutlineContext();

  const { courseId } = useCourseAuthoringContext();

  const { onDeleteConfirm } = useDeleteModal(courseId);

  const {
    isUnlinkModalOpen,
    closeUnlinkModal,
    handleUnlinkItemSubmit,
    displayName: unlinkDisplayName,
    itemCategory: unlinkItemCategory,
  } = useUnlinkModal();

  const deleteItemCategory = deleteModalData?.category ?? '';
  const itemCategoryName = COURSE_BLOCK_NAMES[deleteItemCategory]?.name.toLowerCase();

  return (
    <>
      <EnableHighlightsModal
        isOpen={isEnableHighlightsModalOpen}
        close={closeEnableHighlightsModal}
        onEnableHighlightsSubmit={handleEnableHighlightsSubmit}
      />
      <HighlightsModal
        isOpen={isHighlightsModalOpen}
        onClose={closeHighlightsModal}
        onSubmit={handleHighlightsFormSubmit}
        currentId={highlightsModalCurrentId}
      />
      <PublishModal />
      <ConfigureModal
        isOpen={isConfigureModalOpen}
        onClose={handleConfigureModalClose}
        onConfigureSubmit={handleConfigureItemSubmitWrapper}
        isOverflowVisible={isOverflowVisible}
        currentItemData={configureItemData}
        enableProctoredExams={enableProctoredExams}
        enableTimedExams={enableTimedExams}
        isSelfPaced={statusBarData?.isSelfPaced ?? false}
      />
      <DeleteModal
        category={itemCategoryName}
        isOpen={isDeleteModalOpen}
        close={closeDeleteModal}
        onDeleteSubmit={onDeleteConfirm}
      />
      <UnlinkModal
        displayName={unlinkDisplayName ?? ''}
        category={unlinkItemCategory}
        isOpen={isUnlinkModalOpen}
        close={closeUnlinkModal}
        onUnlinkSubmit={handleUnlinkItemSubmit}
      />
    </>
  );
};

export default OutlineModals;
