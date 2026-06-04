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

  const payloadBuilders: Record<string, (data: typeof configureModalData, vars: Record<string, unknown>) => ConfigureItemPayload> = {
    chapter: (data, vars) => ({ category: 'chapter', sectionId: data!.sectionId, ...vars }) as ChapterConfigurePayload,
    sequential: (data, vars) => ({ category: 'sequential', itemId: data!.currentId, sectionId: data!.sectionId, ...vars }) as SequentialConfigurePayload,
    vertical: (data, vars) => ({ category: 'vertical', unitId: data!.currentId, sectionId: data!.sectionId, ...vars }) as UnitConfigurePayload,
  };

  const handleConfigureItemSubmitWrapper = useCallback(async (variables: Record<string, unknown>) => {
    if (!configureModalData) {
      handleConfigureModalClose();
      return;
    }
    const { category } = configureModalData;
    const builder = payloadBuilders[category];
    if (!builder) {
      handleConfigureModalClose();
      return;
    }
    const payload = builder(configureModalData, variables);
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
