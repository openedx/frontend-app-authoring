import { useMemo } from 'react';
import { debounce } from 'lodash';

import { useClipboard } from '../../../generic/clipboard';
import { handleResponseErrors } from '../../../generic/saving-error-alert/utils';
import { updateSavingStatus } from '../../data/slice';
import { messageTypes } from '../../constants';
import { MessageHandlersTypes, UseMessageHandlersTypes } from './types';

/**
 * Hook for creating message handlers used to handle iframe messages.
 *
 * @param params - The parameters required to create message handlers.
 * @returns {MessageHandlersTypes} - An object mapping message types to their handler functions.
 */
export const useMessageHandlers = ({
  courseId,
  navigate,
  dispatch,
  setIframeOffset,
  handleDeleteXBlock,
  handleDuplicateXBlock,
  handleScrollToXBlock,
  handleManageXBlockAccess,
  handleShowLegacyEditXBlockModal,
  handleCloseLegacyEditorXBlockModal,
  handleSaveEditedXBlockData,
  handleFinishXBlockDragging,
  handleOpenManageTagsModal,
}: UseMessageHandlersTypes): MessageHandlersTypes => {
  const { copyToClipboard } = useClipboard();

  return useMemo(() => ({
    [messageTypes.copyXBlock]: ({ usageId }) => copyToClipboard(usageId),
    [messageTypes.deleteXBlock]: ({ usageId }) => handleDeleteXBlock(usageId),
    [messageTypes.newXBlockEditor]: ({ blockType, usageId }) => navigate(`/course/${courseId}/editor/${blockType}/${usageId}`),
    [messageTypes.duplicateXBlock]: ({ blockType, usageId }) => handleDuplicateXBlock(blockType, usageId),
    [messageTypes.manageXBlockAccess]: ({ usageId }) => handleManageXBlockAccess(usageId),
    [messageTypes.scrollToXBlock]: debounce(({ scrollOffset }) => handleScrollToXBlock(scrollOffset), 1000),
    [messageTypes.toggleCourseXBlockDropdown]: ({
      courseXBlockDropdownHeight,
    }: { courseXBlockDropdownHeight: number }) => setIframeOffset(courseXBlockDropdownHeight),
    [messageTypes.editXBlock]: ({ id }) => handleShowLegacyEditXBlockModal(id),
    [messageTypes.closeXBlockEditorModal]: handleCloseLegacyEditorXBlockModal,
    [messageTypes.saveEditedXBlockData]: handleSaveEditedXBlockData,
    [messageTypes.studioAjaxError]: ({ error }) => handleResponseErrors(error, dispatch, updateSavingStatus),
    [messageTypes.refreshPositions]: handleFinishXBlockDragging,
    [messageTypes.openManageTags]: (payload) => handleOpenManageTagsModal(payload.contentId),
  }), [
    courseId,
    handleDeleteXBlock,
    handleDuplicateXBlock,
    handleManageXBlockAccess,
    handleScrollToXBlock,
    copyToClipboard,
  ]);
};
