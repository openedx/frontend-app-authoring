import { useCallback } from 'react';

import { getBlockType } from '@src/generic/key-utils';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { useUnlinkDownstream } from '@src/generic/unlink-modal';

export interface UseUnlinkModalOutput {
  isUnlinkModalOpen: boolean;
  closeUnlinkModal: () => void;
  handleUnlinkItemSubmit: () => Promise<void>;
  displayName?: string;
  itemCategory: string;
}

/**
 * Unlink confirmation modal hook.
 * Reads unlink state from CourseAuthoringContext, delegates mutation to useUnlinkDownstream.
 */
export function useUnlinkModal(): UseUnlinkModalOutput {
  const {
    isUnlinkModalOpen,
    currentUnlinkModalData,
    closeUnlinkModal,
  } = useCourseAuthoringContext();
  const { mutateAsync: unlinkDownstream } = useUnlinkDownstream();

  const unlinkItemCategory = currentUnlinkModalData?.value?.id
    ? getBlockType(currentUnlinkModalData.value.id)
    : '';

  const handleUnlinkItemSubmit = useCallback(async () => {
    if (!currentUnlinkModalData) { return; }
    await unlinkDownstream({
      downstreamBlockId: currentUnlinkModalData.value!.id,
      sectionId: currentUnlinkModalData.sectionId,
      subsectionId: currentUnlinkModalData.subsectionId,
    }, {
      onSuccess: () => {
        closeUnlinkModal();
      },
    });
  }, [currentUnlinkModalData, unlinkDownstream, closeUnlinkModal]);

  return {
    isUnlinkModalOpen,
    closeUnlinkModal,
    handleUnlinkItemSubmit,
    displayName: currentUnlinkModalData?.value?.displayName,
    itemCategory: unlinkItemCategory,
  };
}
