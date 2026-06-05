import { XBlockActions, XblockChildInfo } from '@src/data/types';
import { PUBLISH_TYPES } from '@src/course-unit/constants';

export interface CourseStructure {
  id: string;
  displayName: string;
  childInfo?: XblockChildInfo;
  highlightsEnabledForMessaging: boolean;
  videoSharingEnabled: boolean;
  videoSharingOptions: string;
  start: string;
  end: string;
  actions: XBlockActions;
  hasChanges: boolean;
  enableProctoredExams?: boolean;
  enableTimedExams?: boolean;
}

export interface CourseOutline {
  courseReleaseDate: string;
  courseStructure: CourseStructure;
  deprecatedBlocksInfo: Record<string, any>; // TODO: Create interface for this type
  discussionsIncontextLearnmoreUrl: string;
  discussionsSettings?: { providerType: string; enableGradedUnits: boolean; };
  advanceSettingsUrl?: string;
  initialState: Record<string, any>; // TODO: Create interface for this type
  initialUserClipboard: Record<string, any>; // TODO: Create interface for this type
  languageCode: string;
  lmsLink: string;
  mfeProctoredExamSettingsUrl: string;
  notificationDismissUrl: string;
  proctoringErrors: string[];
  reindexLink: string;
  rerunNotificationId: null;
  isCustomRelativeDatesActive?: boolean;
  createdOn?: string;
}

// TODO: This interface has only basic data, all the rest needs to be added.
export interface CourseDetails {
  courseId: string;
  title: string;
  subtitle?: string;
  org: string;
  description?: string;
  hasChanges: boolean;
  selfPaced: boolean;
}

export interface ChecklistType {
  totalCourseLaunchChecks: number;
  completedCourseLaunchChecks: number;
  totalCourseBestPracticesChecks: number;
  completedCourseBestPracticesChecks: number;
}

export interface CourseOutlineStatusBar {
  courseReleaseDate: string;
  endDate: string;
  highlightsEnabledForMessaging: boolean;
  isSelfPaced: boolean;
  checklist: ChecklistType;
  videoSharingEnabled: boolean;
  videoSharingOptions: string;
}

export type OutlineLoadingStatus = {
  outlineIndexIsLoading: boolean;
  outlineIndexIsDenied: boolean;
  reIndexLoadingStatus: string;
  fetchSectionLoadingStatus: string;
  courseLaunchQueryStatus: string;
};

export interface CourseItemUpdateResult {
  id: string;
  data?: object | null;
  metadata: {
    downstreamCustomized?: string[];
    topLevelDownstreamParentKey?: string;
    upstream?: string;
    upstreamDisplayName?: string;
    upstreamVersion?: number;
    displayName?: string;
  };
}

export interface ConfigureSectionData {
  sectionId: string;
  isVisibleToStaffOnly: boolean;
  startDatetime: string;
}

export interface ConfigureSubsectionData {
  itemId: string;
  isVisibleToStaffOnly?: boolean;
  releaseDate?: string;
  graderType?: string;
  dueDate?: string;
  isTimeLimited?: boolean;
  isProctoredExam?: boolean;
  isOnboardingExam?: boolean;
  isPracticeExam?: boolean;
  examReviewRules?: string;
  defaultTimeLimitMinutes?: number;
  hideAfterDue?: boolean;
  showCorrectness?: 'always' | 'never' | 'past_due' | 'never_but_include_grade';
  isPrereq?: boolean;
  prereqUsageKey?: string;
  prereqMinScore?: number;
  prereqMinCompletion?: number;
}

export interface ConfigureUnitData {
  unitId: string;
  isVisibleToStaffOnly: boolean;
  type: typeof PUBLISH_TYPES[keyof typeof PUBLISH_TYPES];
  groupAccess: Record<string, any> | null;
  discussionEnabled?: boolean;
}

export type StaticFileNotices = {
  conflictingFiles: string[];
  errorFiles: string[];
  newFiles: string[];
};

// ─── Configure flow payloads (category-discriminated) ─────────────────────

export type ChapterConfigurePayload = {
  category: 'chapter';
  sectionId: string;
  isVisibleToStaffOnly: boolean;
  startDatetime: string;
};

export type SequentialConfigurePayload = {
  category: 'sequential';
  itemId: string;
  sectionId: string;
} & Partial<ConfigureSubsectionData>;

export type UnitConfigurePayload = {
  category: 'vertical';
  unitId: string;
  sectionId: string;
  isVisibleToStaffOnly: boolean;
  type: typeof PUBLISH_TYPES[keyof typeof PUBLISH_TYPES];
  groupAccess: Record<string, any> | null;
  discussionEnabled?: boolean;
};

export type ConfigureItemPayload =
  | ChapterConfigurePayload
  | SequentialConfigurePayload
  | UnitConfigurePayload;
