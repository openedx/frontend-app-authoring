import { UserPartitionTypes } from '@src/data/types';

export interface XBlockActionsTypes {
  canCopy: boolean;
  canDuplicate: boolean;
  canMove: boolean;
  canManageAccess: boolean;
  canDelete: boolean;
  canManageTags: boolean;
}

export interface XBlockTypes {
  name: string;
  blockId: string;
  blockType: string;
  userPartitionInfo: {
    selectablePartitions: any[];
    selectedPartitionIndex: number;
    selectedGroupsLabel: string;
  };
  userPartitions: Array<UserPartitionTypes>;
  upstreamLink: string | null;
  actions: XBlockActionsTypes;
  validationMessages: any[];
  renderError: string;
  id: string;
}

export interface XBlockContainerIframeProps {
  courseId: string;
  blockId: string;
  isUnitVerticalType: boolean,
  unitXBlockActions: {
    handleDelete: (XBlockId: string | null) => Promise<void> | void;
    handleDuplicate: (XBlockId: string | null) => void;
    handleUnlink: (XBlockId: string | null) => Promise<void> | void;
  };
  courseVerticalChildren: Array<XBlockTypes>;
  readonly?: boolean;
}
