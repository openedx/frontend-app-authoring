export type UseMessageHandlersTypes = {
  courseId: string;
  dispatch: (action: any) => void;
  setIframeOffset: (height: number) => void;
  handleDeleteXBlock: (usageId: string) => void;
  handleUnlinkXBlock: (usageId: string) => void;
  handleScrollToXBlock: (scrollOffset: number) => void;
  handleDuplicateXBlock: (usageId: string) => void;
  handleEditXBlock: (blockType: string, usageId: string) => void;
  handleManageXBlockAccess: (usageId: string) => void;
  handleShowLegacyEditXBlockModal: (id: string) => void;
  handleCloseLegacyEditorXBlockModal: () => void;
  handleSaveEditedXBlockData: () => void;
  handleFinishXBlockDragging: () => void;
  handleOpenManageTagsModal: (id: string) => void;
  handleShowProcessingNotification: (variant: string) => void;
  handleHideProcessingNotification: () => void;
  handleRefreshIframe: () => void;
  handleXBlockSelected: (id: string) => void;
};

export type MessageHandlersTypes = Record<string, (payload: any) => void>;
