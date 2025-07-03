export interface GroupTypes {
  id: number;
  name: string;
  selected: boolean;
  deleted: boolean;
}

export interface UserPartitionTypes {
  id: number;
  name: string;
  scheme: string;
  groups: Array<GroupTypes>;
}

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
  courseUnitLoadingStatus: {
    fetchUnitLoadingStatus: string;
    fetchVerticalChildrenLoadingStatus: string;
    fetchXBlockDataLoadingStatus: string;
  };
  unitXBlockActions: {
    handleDelete: (XBlockId: string | null) => void;
    handleDuplicate: (XBlockId: string | null) => void;
  };
  courseVerticalChildren: Array<XBlockTypes>;
  handleConfigureSubmit: (XBlockId: string, ...args: any[]) => void;
}

export type UserPartitionInfoTypes = {
  selectablePartitions: Array<{
    groups: Array<{
      deleted: boolean;
      id: number;
      name: string;
      selected: boolean;
    }>;
    id: number;
    name: string;
    scheme: string;
  }>;
  selectedPartitionIndex: number;
  selectedGroupsLabel: string;
};

export type PrereqTypes = {
  blockDisplayName: string;
  blockUsageKey: string;
};

export type AccessManagedXBlockDataTypes = {
  id: string;
  displayName?: string;
  start?: string;
  visibilityState?: string | boolean;
  blockType: string;
  due?: string;
  isTimeLimited?: boolean;
  defaultTimeLimitMinutes?: number;
  hideAfterDue?: boolean;
  showCorrectness?: string | boolean;
  courseGraders?: string[];
  category?: string;
  format?: string;
  userPartitionInfo?: UserPartitionInfoTypes;
  ancestorHasStaffLock?: boolean;
  isPrereq?: boolean;
  prereqs?: PrereqTypes[];
  prereq?: number;
  prereqMinScore?: number;
  prereqMinCompletion?: number;
  releasedToStudents?: boolean;
  wasExamEverLinkedWithExternal?: boolean;
  isProctoredExam?: boolean;
  isOnboardingExam?: boolean;
  isPracticeExam?: boolean;
  examReviewRules?: string;
  supportsOnboarding?: boolean;
  showReviewRules?: boolean;
  onlineProctoringRules?: string;
  discussionEnabled: boolean;
};

export type FormattedAccessManagedXBlockDataTypes = Omit<AccessManagedXBlockDataTypes, 'discussionEnabled'>;
