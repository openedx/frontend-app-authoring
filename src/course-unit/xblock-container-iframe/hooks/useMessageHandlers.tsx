import { useMemo } from 'react';
import { debounce } from 'lodash';

import { useClipboard } from '@src/generic/clipboard';
import { messageTypes } from '@src/course-unit/constants';
import { handleResponseErrors } from '@src/generic/saving-error-alert';
import { updateSavingStatus } from '@src/course-unit/data/slice';
import { NOTIFICATION_MESSAGES } from '@src/constants';

import { MessageHandlersTypes, UseMessageHandlersTypes } from './types';

/**
 * Hook for creating message handlers used to handle iframe messages.
 *
 * @param params - The parameters required to create message handlers.
 * @returns {MessageHandlersTypes} - An object mapping message types to their handler functions.
 */
export const useMessageHandlers = ({
  courseId,
  dispatch,
  setIframeOffset,
  handleDeleteXBlock,
  handleDuplicateXBlock,
  handleUnlinkXBlock,
  handleScrollToXBlock,
  handleManageXBlockAccess,
  handleShowLegacyEditXBlockModal,
  handleCloseLegacyEditorXBlockModal,
  handleSaveEditedXBlockData,
  handleFinishXBlockDragging,
  handleOpenManageTagsModal,
  handleShowProcessingNotification,
  handleHideProcessingNotification,
  handleEditXBlock,
  handleRefreshIframe,
  handleXBlockSelected,
}: UseMessageHandlersTypes): MessageHandlersTypes => {
  const { copyToClipboard } = useClipboard();

  return useMemo(() => ({
    [messageTypes.copyXBlock]: ({ usageId }) => copyToClipboard(usageId),
    [messageTypes.deleteXBlock]: ({ usageId }) => handleDeleteXBlock(usageId),
    [messageTypes.unlinkXBlock]: ({ usageId }) => handleUnlinkXBlock(usageId),
    [messageTypes.newXBlockEditor]: ({ blockType, usageId }) => handleEditXBlock(blockType, usageId),
    [messageTypes.duplicateXBlock]: ({ usageId }) => handleDuplicateXBlock(usageId),
    [messageTypes.manageXBlockAccess]: ({ usageId }) => handleManageXBlockAccess(usageId),
    [messageTypes.scrollToXBlock]: debounce(({ scrollOffset }) => handleScrollToXBlock(scrollOffset), 1000),
    [messageTypes.toggleCourseXBlockDropdown]: ({
      courseXBlockDropdownHeight,
    }) => setIframeOffset(courseXBlockDropdownHeight),
    [messageTypes.editXBlock]: ({ id }) => handleShowLegacyEditXBlockModal(id),
    [messageTypes.closeXBlockEditorModal]: handleCloseLegacyEditorXBlockModal,
    [messageTypes.saveEditedXBlockData]: handleSaveEditedXBlockData,
    [messageTypes.studioAjaxError]: ({ error }) => handleResponseErrors(error, dispatch, updateSavingStatus),
    [messageTypes.refreshPositions]: handleFinishXBlockDragging,
    [messageTypes.refreshIframe]: handleRefreshIframe,
    [messageTypes.openManageTags]: (payload) => handleOpenManageTagsModal(payload.contentId),
    [messageTypes.addNewComponent]: () => handleShowProcessingNotification(NOTIFICATION_MESSAGES.adding),
    [messageTypes.pasteNewComponent]: () => handleShowProcessingNotification(NOTIFICATION_MESSAGES.pasting),
    [messageTypes.copyXBlockLegacy]: /* istanbul ignore next */ () => handleShowProcessingNotification(
      NOTIFICATION_MESSAGES.copying,
    ),
    [messageTypes.hideProcessingNotification]: handleHideProcessingNotification,
    [messageTypes.handleRedirectToXBlockEditPage]: /* istanbul ignore next */ (payload) => handleEditXBlock(
      payload.type,
      payload.locator,
    ),
    [messageTypes.xblockSelected]: ({ contentId }) => handleXBlockSelected(contentId),
  }), [
    courseId,
    handleDeleteXBlock,
    handleUnlinkXBlock,
    handleDuplicateXBlock,
    handleManageXBlockAccess,
    handleScrollToXBlock,
    copyToClipboard,
    handleXBlockSelected,
  ]);
};
