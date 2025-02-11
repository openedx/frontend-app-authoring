import { useMemo } from 'react';
import { debounce } from 'lodash';

import { copyToClipboard } from '../../../generic/data/thunks';
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
}: UseMessageHandlersTypes): MessageHandlersTypes => useMemo(() => ({
  [messageTypes.copyXBlock]: ({ usageId }) => dispatch(copyToClipboard(usageId)),
  [messageTypes.deleteXBlock]: ({ usageId }) => handleDeleteXBlock(usageId),
  [messageTypes.newXBlockEditor]: ({ blockType, usageId }) => navigate(`/course/${courseId}/editor/${blockType}/${usageId}`),
  [messageTypes.duplicateXBlock]: ({ blockType, usageId }) => handleDuplicateXBlock(blockType, usageId),
  [messageTypes.manageXBlockAccess]: ({ usageId }) => handleManageXBlockAccess(usageId),
  [messageTypes.scrollToXBlock]: debounce(({ scrollOffset }) => handleScrollToXBlock(scrollOffset), 3000),
  [messageTypes.toggleCourseXBlockDropdown]: ({
    courseXBlockDropdownHeight,
  }: { courseXBlockDropdownHeight: number }) => setIframeOffset(courseXBlockDropdownHeight),
}), [
  courseId,
  handleDeleteXBlock,
  handleDuplicateXBlock,
  handleManageXBlockAccess,
  handleScrollToXBlock,
]);
