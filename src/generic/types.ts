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
