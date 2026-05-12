import { useToggle } from '@openedx/paragon';

import { useToggleWithValue } from '@src/hooks';
import { ModalState } from '@src/CourseAuthoringContext';

export type UseOutlineModalState = {
  isDeleteModalOpen: boolean;
  openDeleteModal: () => void;
  closeDeleteModal: () => void;
  isPublishModalOpen: boolean;
  currentPublishModalData: ModalState | undefined;
  openPublishModal: (value: ModalState) => void;
  closePublishModal: () => void;
};

/**
 * Manages delete modal and publish modal state for the course outline.
 */
const useOutlineModalState = (): UseOutlineModalState => {
  const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useToggle(false);
  const [
    isPublishModalOpen,
    currentPublishModalData,
    openPublishModal,
    closePublishModal,
  ] = useToggleWithValue<ModalState>();

  return {
    isDeleteModalOpen,
    openDeleteModal,
    closeDeleteModal,
    isPublishModalOpen,
    currentPublishModalData,
    openPublishModal,
    closePublishModal,
  };
};

export default useOutlineModalState;
