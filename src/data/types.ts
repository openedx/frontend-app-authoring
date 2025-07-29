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

export interface XBlockActions {
  deletable: boolean;
  draggable: boolean;
  childAddable: boolean;
  duplicable: boolean;
  allowMoveDown?: boolean;
  allowMoveUp?: boolean;
}

export interface XblockChildInfo {
  displayName: string;
  children: Array<XBlock>;
}

export interface XBlockPrereqs {
  blockUsageKey: string;
  blockDisplayName: string;
}

export interface UpstreeamInfo {
  readyToSync: boolean,
  upstreamRef: string,
  versionSynced: number,
}

export interface XBlock {
  id: string;
  locator: string;
  usageKey: string;
  displayName: string;
  category: string;
  hasChildren: boolean;
  editedOn: string;
  published: boolean;
  publishedOn: string;
  studioUrl: string;
  releasedToStudents: boolean;
  releaseDate: string;
  visibilityState: string;
  hasExplicitStaffLock: boolean;
  start: string;
  graded: boolean;
  dueDate: string;
  due?: string;
  relativeWeeksDue?: number;
  format?: string;
  courseGraders: string[];
  hasChanges: boolean;
  actions: XBlockActions;
  explanatoryMessage?: string;
  userPartitions: UserPartitionTypes[];
  showCorrectness: string;
  highlights: string[];
  highlightsEnabled: boolean;
  highlightsPreviewOnly: boolean;
  highlightsDocUrl: string;
  childInfo: XblockChildInfo;
  ancestorHasStaffLock: boolean;
  staffOnlyMessage: boolean;
  hasPartitionGroupComponents: boolean;
  userPartitionInfo?: UserPartitionInfoTypes;
  enableCopyPasteUnits: boolean;
  shouldScroll: boolean;
  isHeaderVisible: boolean;
  proctoringExamConfigurationLink?: string;
  isTimeLimited?: boolean;
  defaultTimeLimitMinutes?: number;
  hideAfterDue?: boolean;
  isProctoredExam?: boolean;
  isPracticeExam?: boolean;
  isOnboardingExam?: boolean;
  examReviewRules?: string;
  isPrereq?: boolean;
  prereq?: string;
  prereqs?: XBlockPrereqs[];
  prereqMinScore?: number;
  prereqMinCompletion?: number;
  discussionEnabled?: boolean;
  upstreamInfo?: UpstreeamInfo;
}
