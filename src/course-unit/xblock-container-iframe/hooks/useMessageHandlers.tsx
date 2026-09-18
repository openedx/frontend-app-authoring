import { useMemo } from 'react';
import { debounce } from 'lodash';

import { getConfig } from '@edx/frontend-platform';

import { useClipboard } from '@src/generic/clipboard';
import { xblockEditorSlotIds } from '@src/plugin-slots/XBlockEditorSlot';
import { messageTypes } from '@src/course-unit/constants';
import { handleResponseErrors } from '@src/generic/saving-error-alert';
import { updateSavingStatus } from '@src/course-unit/data/slice';
import { NOTIFICATION_MESSAGES } from '@src/constants';

import { MessageHandlersTypes, UseMessageHandlersTypes } from './types';

/** Pulls `games` out of `block-v1:Org+Course+Run+type@games+block@abc123`. */
const blockTypeFromUsageKey = (usageId: string): string | null => {
  const match = /type@([^+]+)\+block@/.exec(decodeURIComponent(usageId));
  return match ? match[1] : null;
};

/**
 * True when an out-of-tree plugin has claimed the editor slot for this block
 * type, that is, when the slot's effective config has at least one plugin.
 *
 * "Effective" follows the framework's own rule: `PluginSlot` treats the slot
 * id and its aliases as one key and uses only the *last* configured entry
 * among them (`usePluginSlot`). This must judge that same entry, or a block
 * could be routed to an editor that the slot then renders without a plugin.
 * An entry with no plugins is treated as unclaimed, the same as no entry, so
 * the block keeps its legacy-modal path.
 *
 * Studio only routes a hardcoded set of block types to this app's editor;
 * everything else arrives as a legacy-modal request. Checking the slot registry
 * here lets a plugin claim its own block type without any edx-platform change.
 */
const hasEditorPlugin = (blockType: string | null): boolean => {
  if (!blockType) { return false; }
  const slots: Record<string, { plugins?: unknown[]; } | undefined> = getConfig()?.pluginSlots ?? {};
  const slotIds = xblockEditorSlotIds(blockType);
  const configuredIds = Object.keys(slots).filter((id) => slotIds.includes(id));
  const effectiveId = configuredIds[configuredIds.length - 1];
  return effectiveId !== undefined && (slots[effectiveId]?.plugins?.length ?? 0) > 0;
};

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
    [messageTypes.editXBlock]: ({ id }) => {
      const blockType = blockTypeFromUsageKey(id);
      if (hasEditorPlugin(blockType)) {
        handleEditXBlock(blockType as string, id);
        return;
      }
      handleShowLegacyEditXBlockModal(id);
    },
    [messageTypes.closeXBlockEditorModal]: handleCloseLegacyEditorXBlockModal,
    [messageTypes.saveEditedXBlockData]: handleSaveEditedXBlockData,
    [messageTypes.studioAjaxError]: ({ error }) => handleResponseErrors(error, dispatch, updateSavingStatus),
    [messageTypes.refreshPositions]: handleFinishXBlockDragging,
    [messageTypes.refreshIframe]: handleRefreshIframe,
    [messageTypes.openManageTags]: (payload) => handleOpenManageTagsModal(payload.contentId),
    [messageTypes.addNewComponent]: () => handleShowProcessingNotification(NOTIFICATION_MESSAGES.adding),
    [messageTypes.pasteNewComponent]: () => handleShowProcessingNotification(NOTIFICATION_MESSAGES.pasting),
    [messageTypes.copyXBlockLegacy]: /* istanbul ignore next */ () =>
      handleShowProcessingNotification(
        NOTIFICATION_MESSAGES.copying,
      ),
    [messageTypes.hideProcessingNotification]: handleHideProcessingNotification,
    [messageTypes.handleRedirectToXBlockEditPage]: /* istanbul ignore next */ (payload) =>
      handleEditXBlock(
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
