export type UseMessageHandlersTypes = {
  courseId: string;
  navigate: (path: string) => void;
  dispatch: (action: any) => void;
  setIframeOffset: (height: number) => void;
  handleDeleteXBlock: (usageId: string) => void;
  handleScrollToXBlock: (scrollOffset: number) => void;
  handleDuplicateXBlock: (blockType: string, usageId: string) => void;
  handleManageXBlockAccess: (usageId: string) => void;
};

export type MessageHandlersTypes = Record<string, (payload: any) => void>;

export interface UseIFrameBehaviorTypes {
  id: string;
  iframeUrl: string;
  onLoaded?: boolean;
}

export interface UseIFrameBehaviorReturnTypes {
  iframeHeight: number;
  handleIFrameLoad: () => void;
  showError: boolean;
  hasLoaded: boolean;
}
