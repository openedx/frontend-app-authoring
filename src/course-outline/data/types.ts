import { XBlock, XBlockActions } from '@src/data/types';

export interface CourseStructure {
  highlightsEnabledForMessaging: boolean,
  videoSharingEnabled: boolean,
  videoSharingOptions: string,
  start: string,
  end: string,
  actions: XBlockActions,
  hasChanges: boolean,
}

export interface CourseOutline {
  courseReleaseDate: string;
  courseStructure: CourseStructure;
  deprecatedBlocksInfo: Record<string, any>; // TODO: Create interface for this type
  discussionsIncontextLearnmoreUrl: string;
  initialState: Record<string, any>; // TODO: Create interface for this type
  initialUserClipboard: Record<string, any>; // TODO: Create interface for this type
  languageCode: string;
  lmsLink: string;
  mfeProctoredExamSettingsUrl: string;
  notificationDismissUrl: string;
  proctoringErrors: string[];
  reindexLink: string;
  rerunNotificationId: null;
}

// TODO: This interface has only basic data, all the rest needs to be added.
export interface CourseDetails {
  courseId: string;
  title: string;
  subtitle?: string;
  org: string;
  description?: string;
  hasChanges: boolean;
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

export interface CourseOutlineState {
  loadingStatus: {
    outlineIndexLoadingStatus: string;
    reIndexLoadingStatus: string;
    fetchSectionLoadingStatus: string;
    courseLaunchQueryStatus: string;
  };
  errors: {
    outlineIndexApi: null | object;
    reindexApi: null | object;
    sectionLoadingApi: null | object;
    courseLaunchApi: null | object;
  };
  outlineIndexData: object;
  savingStatus: string;
  statusBarData: CourseOutlineStatusBar;
  sectionsList: Array<XBlock>;
  isCustomRelativeDatesActive: boolean;
  actions: XBlockActions;
  enableProctoredExams: boolean;
  enableTimedExams: boolean;
  pasteFileNotices: object;
  createdOn: null | Date;
}

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
  }
}
