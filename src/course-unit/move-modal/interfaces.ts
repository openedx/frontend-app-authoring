export interface IXBlockInfo {
    id: string;
    displayName: string;
    child_info?: {
        children?: IXBlockInfo[];
    };
    category?: string;
    has_children?: boolean;
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
    handleXBlockClick: (newParentIndex: string|number) => void;
    handleBreadcrumbsClick: (newParentIndex: string|number) => void;
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
    child_info?: {
        children?: ITreeNode[];
    };
}

export interface IXBlockInfo {
    category?: string;
    hasChildren?: boolean;
    has_children?: boolean;
}

export interface IAncestor {
    category?: string;
    display_name?: string;
}

export interface IMoveModalProps {
    isOpenModal: boolean,
    closeModal: () => void,
    openModal: () => void,
    courseId: string,
}

export interface IXBlockChildInfo {
    category?: string;
    display_name?: string;
    children?: IXBlock[];
}

export interface IXBlock {
    id: string;
    display_name: string;
    category: string;
    has_children: boolean;
    child_info?: IXBlockChildInfo;
}
