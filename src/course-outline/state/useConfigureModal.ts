import { useCallback } from 'react';

import type { OutlineActionSelection, XBlock } from '@src/data/types';
import {
  useCourseItemData,
  useConfigureSection,
  useConfigureSubsection,
  useConfigureUnit,
  type ConfigureItemPayload,
  type ChapterConfigurePayload,
  type SequentialConfigurePayload,
  type UnitConfigurePayload,
} from '../data';
import { COURSE_BLOCK_NAMES } from '../constants';
import { useModalState } from './useModalState';

export interface UseConfigureDialogOutput {
  isConfigureModalOpen: boolean;
  handleConfigureModalClose: () => void;
  handleOpenConfigureModal: (selection: OutlineActionSelection) => void;
  handleConfigureItemSubmitWrapper: (variables: Record<string, unknown>) => Promise<void>;
  isOverflowVisible: boolean;
  currentItemData?: XBlock;
}

/**
 * Configure modal hook — manage configure dialog state and submission.
 */
export function useConfigureDialog(courseId: string): UseConfigureDialogOutput {
  const configureSectionMutation = useConfigureSection(courseId);
  const configureSubsectionMutation = useConfigureSubsection(courseId);
  const configureUnitMutation = useConfigureUnit(courseId);

  const configureMutationMap = {
    chapter: configureSectionMutation,
    sequential: configureSubsectionMutation,
    vertical: configureUnitMutation,
  } as const;

  const handleConfigureItemSubmit = useCallback(
    async (payload: ConfigureItemPayload): Promise<boolean> => {
      if (!payload) { return false; }
      try {
        const { category: _, ...rest } = payload;
        await configureMutationMap[payload.category].mutateAsync(rest as any);
        return true;
      } catch {
        return false;
      }
    },
    [configureSectionMutation, configureSubsectionMutation, configureUnitMutation],
  );

  const {
    isOpen: isConfigureModalOpen,
    open: openConfigureModal,
    close: closeConfigureModal,
    data: configureModalData,
  } = useModalState<OutlineActionSelection>();

  const { data: configureItemData } = useCourseItemData(
    isConfigureModalOpen ? configureModalData?.currentId : undefined,
  );

  const configureItemCategory = configureItemData?.category || '';
  const isOverflowVisible = configureItemCategory === COURSE_BLOCK_NAMES.chapter.id;

  const handleConfigureModalClose = useCallback(() => {
    closeConfigureModal();
  }, [closeConfigureModal]);

  const handleOpenConfigureModal = useCallback((selection: OutlineActionSelection) => {
    openConfigureModal(selection);
  }, [openConfigureModal]);

  const payloadBuilders: Record<
    string,
    (data: typeof configureModalData, vars: Record<string, unknown>) => ConfigureItemPayload
  > = {
    chapter: (data, vars) => ({ category: 'chapter', sectionId: data!.sectionId, ...vars }) as ChapterConfigurePayload,
    sequential: (data, vars) =>
      ({
        category: 'sequential',
        itemId: data!.currentId,
        sectionId: data!.sectionId,
        ...vars,
      }) as SequentialConfigurePayload,
    vertical: (data, vars) =>
      ({ category: 'vertical', unitId: data!.currentId, sectionId: data!.sectionId, ...vars }) as UnitConfigurePayload,
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
