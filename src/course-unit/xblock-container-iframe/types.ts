export interface XBlockContainerIframeProps {
  courseId: string;
  blockId: string;
  unitXBlockActions: {
    handleDelete: (XBlockId: string | null) => void;
    handleDuplicate: (XBlockId: string | null) => void;
  };
  courseVerticalChildren: Array<XBlock>;
  handleConfigureSubmit: (XBlockId: string, ...args: any[]) => void;
}

export interface XBlockDataTypes {
  id: string | null;
  blockType: string;
}

export interface XBlock {
  name: string;
  blockId: string;
  blockType: string;
  userPartitionInfo: {
    selectablePartitions: any[];
    selectedPartitionIndex: number;
    selectedGroupsLabel: string;
  };
  userPartitions: Array<UserPartition>;
  upstreamLink: string | null;
  actions: XBlockActions;
  validationMessages: any[];
  renderError: string;
  id: string;
}

export interface UserPartition {
  id: number;
  name: string;
  scheme: string;
  groups: Array<Group>;
}

export interface Group {
  id: number;
  name: string;
  selected: boolean;
  deleted: boolean;
}

export interface XBlockActions {
  canCopy: boolean;
  canDuplicate: boolean;
  canMove: boolean;
  canManageAccess: boolean;
  canDelete: boolean;
  canManageTags: boolean;
}

export type MessagePayloadTypes = {
  id: string;
  url?: string;
  message?: string;
  courseXBlockDropdownHeight: number;
};
