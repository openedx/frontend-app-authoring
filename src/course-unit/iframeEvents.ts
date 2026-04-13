import { messageTypes } from './constants';

export interface XBlockInfo {
  id: string;
  displayName: string;
  category: string;
}

/**
 * Dispatches a window message event to open the "Move XBlock" modal in the course unit iframe.
 */
export const dispatchShowMoveXBlockModal = (
  sourceXBlockInfo: XBlockInfo,
  sourceParentXBlockInfo: XBlockInfo,
) => {
  window.dispatchEvent(new MessageEvent('message', {
    data: {
      type: messageTypes.showMoveXBlockModal,
      payload: {
        sourceXBlockInfo,
        sourceParentXBlockInfo,
      },
    },
  }));
};
