import { XBlock, XBlockActions } from '@src/data/types';
import { UserTaskStatus } from '../../data/constants';

export interface CourseStructure {
  highlightsEnabledForMessaging: boolean,
  videoSharingEnabled: boolean,
  videoSharingOptions: string,
  start: string,
  end: string,
  actions: XBlockActions,
}

// TODO: Create interface for all `Object` fields in courseOutline
export interface CourseOutline {
  courseReleaseDate: string;
  courseStructure: CourseStructure;
  deprecatedBlocksInfo: Object;
  discussionsIncontextLearnmoreUrl: string;
  initialState: Object;
  initialUserClipboard: Object;
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
}

export interface CourseOutlineStatusBar {
  courseReleaseDate: string;
  endDate: string;
  highlightsEnabledForMessaging: boolean;
  isSelfPaced: boolean;
  checklist: {
    totalCourseLaunchChecks: number;
    completedCourseLaunchChecks: number;
    totalCourseBestPracticesChecks: number;
    completedCourseBestPracticesChecks: number;
  };
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
  currentSection: XBlock | {};
  currentSubsection: XBlock | {};
  currentItem: XBlock | {};
  actions: XBlockActions;
  enableProctoredExams: boolean;
  enableTimedExams: boolean;
  pasteFileNotices: object;
  createdOn: null | Date;
}

export interface UserTaskStatusWithUuid {
  name: string;
  state: UserTaskStatus;
  stateText: string;
  completedSteps: number;
  totalSteps: number;
  attempts: number;
  created: string;
  modified: string;
  uuid: string;
}
