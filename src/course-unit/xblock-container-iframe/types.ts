import { UserPartitionInfoTypes, UserPartitionTypes, XBlockPrereqs } from '@src/data/types';

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
    handleUnlink: (XBlockId: string | null) => void;
  };
  courseVerticalChildren: Array<XBlockTypes>;
  handleConfigureSubmit: (XBlockId: string, ...args: any[]) => void;
  readonly?: boolean;
}

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
  prereqs?: XBlockPrereqs[];
  prereq?: string;
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
