import { XBlock, XBlockActions } from '@src/data/types';

export interface CourseStructure {
  highlightsEnabledForMessaging: boolean,
  videoSharingEnabled: boolean,
  videoSharingOptions: string,
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
  statusBarData: {
    courseReleaseDate: string;
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
  };
  sectionsList: Array<XBlock>;
  isCustomRelativeDatesActive: boolean;
  currentSection: XBlock | {};
  currentSubsection: XBlock | {};
  currentItem: XBlock | {};
  actions: XBlockActions;
  enableProctoredExams: boolean;
  pasteFileNotices: object;
  createdOn: null | Date;
}
