import type { XBlock } from '@src/data/types';
import DeleteModal from '@src/generic/delete-modal/DeleteModal';
import ConfigureModal from '@src/generic/configure-modal/ConfigureModal';
import { UnlinkModal } from '@src/generic/unlink-modal';

import EnableHighlightsModal from './enable-highlights-modal/EnableHighlightsModal';
import HighlightsModal from './highlights-modal/HighlightsModal';
import type { HighlightData } from './highlights-modal/HighlightsModal';
import PublishModal from './publish-modal/PublishModal';

// ─── Domain-grouped sub-interfaces ──────────────────────────────────────

export interface EnableHighlightsGroup {
  isEnableHighlightsModalOpen: boolean;
  closeEnableHighlightsModal: () => void;
  handleEnableHighlightsSubmit: () => void;
}

export interface HighlightsGroup {
  isHighlightsModalOpen: boolean;
  closeHighlightsModal: () => void;
  handleHighlightsFormSubmit: (highlights: HighlightData) => void;
  highlightsModalCurrentId?: string;
}

export interface ConfigureGroup {
  isConfigureModalOpen: boolean;
  handleConfigureModalClose: () => void;
  handleConfigureItemSubmitWrapper: (variables: Record<string, unknown>) => void;
  isOverflowVisible: boolean;
  currentItemData?: XBlock;
  enableProctoredExams?: boolean;
  enableTimedExams?: boolean;
  isSelfPaced: boolean;
  itemCategoryName: string;
}

export interface DeleteGroup {
  isDeleteModalOpen: boolean;
  closeDeleteModal: () => void;
  onDeleteConfirm: () => Promise<void>;
}

export interface UnlinkGroup {
  isUnlinkModalOpen: boolean;
  closeUnlinkModal: () => void;
  handleUnlinkItemSubmit: () => Promise<void>;
  displayName?: string;
  itemCategory: string;
}

export type OutlineModalsProps =
  EnableHighlightsGroup &
  HighlightsGroup &
  ConfigureGroup &
  DeleteGroup &
  UnlinkGroup;

const OutlineModals = ({
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
  currentItemData,
  enableProctoredExams,
  enableTimedExams,
  isSelfPaced,
  itemCategoryName,
  isDeleteModalOpen,
  closeDeleteModal,
  onDeleteConfirm,
  isUnlinkModalOpen,
  closeUnlinkModal,
  handleUnlinkItemSubmit,
  displayName,
  itemCategory,
}: OutlineModalsProps) => (
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
      currentItemData={currentItemData}
      enableProctoredExams={enableProctoredExams}
      enableTimedExams={enableTimedExams}
      isSelfPaced={isSelfPaced}
    />
    <DeleteModal
      category={itemCategoryName}
      isOpen={isDeleteModalOpen}
      close={closeDeleteModal}
      onDeleteSubmit={onDeleteConfirm}
    />
    <UnlinkModal
      displayName={displayName}
      category={itemCategory}
      isOpen={isUnlinkModalOpen}
      close={closeUnlinkModal}
      onUnlinkSubmit={handleUnlinkItemSubmit}
    />
  </>
);

export default OutlineModals;
