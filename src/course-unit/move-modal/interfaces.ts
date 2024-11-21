export interface IXBlockInfo {
  id: string;
  displayName: string;
  childInfo?: {
    children?: IXBlockInfo[];
  };
  category?: string;
  hasChildren?: boolean;
}

export interface IUseMoveModalParams {
  isOpenModal: boolean;
  closeModal: () => void;
  openModal: () => void;
  courseId: string;
}

export interface IUseMoveModalReturn {
  isLoading: boolean;
  isValidMove: boolean;
  isExtraSmall: boolean;
  parentInfo: {
    parent: IXBlockInfo;
    category: string;
  };
  childrenInfo: {
    children: IXBlockInfo[];
    category: string;
  };
  displayName: string;
  sourceXBlockId: string;
  categoryText: string;
  breadcrumbs: string[];
  currentXBlockParentIds: string[];
  handleXBlockClick: (newParentIndex: string | number) => void;
  handleBreadcrumbsClick: (newParentIndex: string | number) => void;
  handleCLoseModal: () => void;
  handleMoveXBlock: () => void;
}

export interface IState {
  sourceXBlockInfo: {
    current: IXBlockInfo;
    parent: IXBlockInfo;
  };
  childrenInfo: {
    children: IXBlockInfo[];
    category: string;
  };
  parentInfo: {
    parent: IXBlockInfo;
    category: string;
  };
  visitedAncestors: IXBlockInfo[];
  isValidMove: boolean;
}

export interface ITreeNode {
  id: string;
  childInfo?: {
    children?: ITreeNode[];
  };
}

export interface IAncestor {
  category?: string;
  displayName?: string;
}

export interface IXBlockChildInfo {
  category?: string;
  displayName?: string;
  children?: IXBlock[];
}

export interface IXBlock {
  id: string;
  displayName: string;
  category: string;
  hasChildren: boolean;
  childInfo?: IXBlockChildInfo;
}
