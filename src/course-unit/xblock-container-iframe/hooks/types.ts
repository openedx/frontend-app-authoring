export type UseMessageHandlersTypes = {
  courseId: string;
  navigate: (path: string) => void;
  dispatch: (action: any) => void;
  setIframeOffset: (height: number) => void;
  handleDeleteXBlock: (usageId: string) => void;
  handleScrollToXBlock: (scrollOffset: number) => void;
  handleDuplicateXBlock: (blockType: string, usageId: string) => void;
  handleManageXBlockAccess: (usageId: string) => void;
  handleShowLegacyEditXBlockModal: (id: string) => void;
  handleCloseLegacyEditorXBlockModal: () => void;
  handleSaveEditedXBlockData: () => void;
  handleFinishXBlockDragging: () => void;
  handleOpenManageTagsModal: (id: string) => void;
  handleShowProcessingNotification: (variant: string) => void;
  handleHideProcessingNotification: () => void;
  handleRedirectToXBlockEditPage: (payload: { type: string, locator: string }) => void;
};

export type MessageHandlersTypes = Record<string, (payload: any) => void>;
