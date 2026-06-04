import { useState, useCallback } from 'react';

import { useToggle } from '@openedx/paragon';
import type { OutlineActionSelection, XBlock } from '@src/data/types';
import {
  useCourseItemData,
  type ConfigureItemPayload,
  type ChapterConfigurePayload,
  type SequentialConfigurePayload,
  type UnitConfigurePayload,
} from '../data';
import { useOutlineConfigureAction } from './useOutlineActions';
import { COURSE_BLOCK_NAMES } from '../constants';

export interface UseConfigureDialogOutput {
  isConfigureModalOpen: boolean;
  handleConfigureModalClose: () => void;
  handleOpenConfigureModal: (selection: OutlineActionSelection) => void;
  handleConfigureItemSubmitWrapper: (variables: Record<string, unknown>) => Promise<void>;
  isOverflowVisible: boolean;
  currentItemData: XBlock | undefined;
}

/**
 * Configure modal hook — manage configure dialog state and submission.
 */
export function useConfigureDialog(courseId: string): UseConfigureDialogOutput {
  const { handleConfigureItemSubmit } = useOutlineConfigureAction(courseId);

  const [isConfigureModalOpen, openConfigureModal, closeConfigureModal] = useToggle(false);
  const [configureModalData, setConfigureModalData] = useState<OutlineActionSelection | undefined>();

  const { data: configureItemData } = useCourseItemData(
    isConfigureModalOpen ? configureModalData?.currentId : undefined,
  );

  const configureItemCategory = configureItemData?.category || '';
  const isOverflowVisible = configureItemCategory === COURSE_BLOCK_NAMES.chapter.id;

  const handleConfigureModalClose = useCallback(() => {
    closeConfigureModal();
    setConfigureModalData(undefined);
  }, [closeConfigureModal]);

  const handleOpenConfigureModal = useCallback((selection: OutlineActionSelection) => {
    setConfigureModalData(selection);
    openConfigureModal();
  }, [openConfigureModal]);

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
          category: 'chapter', sectionId: configureModalData.sectionId, ...variables,
        } as ChapterConfigurePayload;
        break;
      case 'sequential':
        payload = {
          category: 'sequential', itemId: configureModalData.currentId, sectionId: configureModalData.sectionId, ...variables,
        } as SequentialConfigurePayload;
        break;
      case 'vertical':
        payload = {
          category: 'vertical', unitId: configureModalData.currentId, sectionId: configureModalData.sectionId, ...variables,
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
  }, [configureModalData, handleConfigureItemSubmit, handleConfigureModalClose]);

  return {
    isConfigureModalOpen,
    handleConfigureModalClose,
    handleOpenConfigureModal,
    handleConfigureItemSubmitWrapper,
    isOverflowVisible,
    currentItemData: configureItemData as XBlock | undefined,
  };
}
