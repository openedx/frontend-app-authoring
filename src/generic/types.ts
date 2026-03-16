import { MutableRefObject } from 'react';

export interface UseIFrameBehaviorTypes {
  id: string;
  iframeUrl: string;
  onLoaded?: boolean;
  iframeRef: MutableRefObject<HTMLIFrameElement | null>;
  onBlockNotification?: (event: { eventType: string; [key: string]: any }) => void;
}

export interface UseIFrameBehaviorReturnTypes {
  iframeHeight: number;
  handleIFrameLoad: () => void;
  showError: boolean;
  hasLoaded: boolean;
}

export type ParentIds = {
  /** This id will be used to invalidate data of parent subsection */
  subsectionId?: string;
  /** This id will be used to invalidate data of parent section */
  sectionId?: string;
};
