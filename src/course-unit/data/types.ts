import { UpstreamInfo, XBlock } from '@src/data/types';
import { ContainerType } from '@src/generic/key-utils';
import { COMPONENT_TYPES } from '@src/generic/block-type-utils/constants';

export interface MoveInfoData {
  /**
   * The locator of the source block being moved.
   */
  moveSourceLocator: string;
  /**
   * The locator of the parent block where the source is being moved to.
   */
  parentLocator: string;
  /**
   * The index position of the source block.
   */
  sourceIndex: number;
}

export interface CourseOutlineData {
  id: string;
  displayName: string;
  category: string;
  hasChildren: boolean;
  unitLevelDiscussions: boolean;
  childInfo: {
    category: string;
    displayName: string;
    children: XBlock[];
  }
}

export interface ContainerChildData {
  blockId: string;
  blockType: ContainerType | keyof typeof COMPONENT_TYPES;
  id: string;
  name: string;
  upstreamLink: UpstreamInfo;
}

export interface UpstreamReadyToSyncChildrenInfo {
  id: string;
  name: string;
  upstream: string;
  blockType: string;
  downstreamCustomized: string[];
}

export interface CourseContainerChildrenData {
  canPasteComponent: boolean;
  children: ContainerChildData[];
  isPublished: boolean;
  displayName: string;
  upstreamReadyToSyncChildrenInfo: UpstreamReadyToSyncChildrenInfo[];
}
