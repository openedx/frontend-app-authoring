import { useCallback } from 'react';

import { useToggle } from '@openedx/paragon';
import type { XBlock } from '@src/data/types';
import {
  useUpdateCourseSectionHighlights,
  useEnableCourseHighlightsEmails,
} from '../data';
import type { HighlightData } from '../highlights-modal/HighlightsModal';
import { useModalState } from './useModalState';

export interface UseHighlightsModalOutput {
  isEnableHighlightsModalOpen: boolean;
  openEnableHighlightsModal: () => void;
  closeEnableHighlightsModal: () => void;
  handleEnableHighlightsSubmit: () => void;
  isHighlightsModalOpen: boolean;
  closeHighlightsModal: () => void;
  handleOpenHighlightsModal: (section: XBlock) => void;
  handleHighlightsFormSubmit: (highlights: HighlightData) => void;
  highlightsModalCurrentId: string | undefined;
}

/**
 * Section highlights modal hook — manage highlights form and enable-email toggle.
 */
export function useHighlightsModal(courseId: string): UseHighlightsModalOutput {
  const highlightsMutation = useUpdateCourseSectionHighlights(courseId);
  const enableHighlightsEmailsMutation = useEnableCourseHighlightsEmails(courseId);

  const [isEnableHighlightsModalOpen, openEnableHighlightsModal, closeEnableHighlightsModal] = useToggle(false);
  const {
    isOpen: isHighlightsModalOpen,
    open: openHighlightsModal,
    close: closeHighlightsModal,
    data: highlightsModalData,
  } = useModalState<string>();

  const handleEnableHighlightsSubmit = useCallback(() => {
    enableHighlightsEmailsMutation.mutate();
    closeEnableHighlightsModal();
  }, [enableHighlightsEmailsMutation, closeEnableHighlightsModal]);

  const handleOpenHighlightsModal = useCallback((section: XBlock) => {
    openHighlightsModal(section.id);
  }, [openHighlightsModal]);

  const handleHighlightsFormSubmit = useCallback((highlights: HighlightData) => {
    if (!highlightsModalData) { return; }
    const dataToSend = Object.values(highlights).map(s => (typeof s === 'string' ? s.trim() : '')).filter(
      Boolean,
    ) as string[];
    highlightsMutation.mutate({ sectionId: highlightsModalData, highlights: dataToSend });
    closeHighlightsModal();
  }, [highlightsModalData, highlightsMutation, closeHighlightsModal]);

  return {
    isEnableHighlightsModalOpen,
    openEnableHighlightsModal,
    closeEnableHighlightsModal,
    handleEnableHighlightsSubmit,
    isHighlightsModalOpen,
    closeHighlightsModal,
    handleOpenHighlightsModal,
    handleHighlightsFormSubmit,
    highlightsModalCurrentId: highlightsModalData,
  };
}
