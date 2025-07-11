export interface XBlockActions {
  deletable: boolean;
  draggable: boolean;
  childAddable: boolean;
  duplicable: boolean;
  allowMoveDown?: boolean;
  allowMoveUp?: boolean;
}

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

export interface XblockChildInfo {
  displayName: string;
  children: Array<Xblock>;
}

export interface Xblock {
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
  due: null;
  relativeWeeksDue: null;
  format: null;
  courseGraders: string[];
  hasChanges: boolean;
  actions: XBlockActions;
  explanatoryMessage: null;
  userPartitions: object[];
  showCorrectness: string;
  highlights: string[];
  highlightsEnabled: boolean;
  highlightsPreviewOnly: boolean;
  highlightsDocUrl: string;
  childInfo: XblockChildInfo;
  ancestorHasStaffLock: boolean;
  staffOnlyMessage: boolean;
  hasPartitionGroupComponents: boolean;
  userPartitionInfo: object;
  enableCopyPasteUnits: boolean;
  shouldScroll: boolean;
  isHeaderVisible: boolean;
  proctoringExamConfigurationLink?: string;
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
  sectionsList: Array<Xblock>;
  isCustomRelativeDatesActive: boolean;
  currentSection: Xblock | {};
  currentSubsection: Xblock | {};
  currentItem: Xblock | {};
  actions: XBlockActions;
  enableProctoredExams: boolean;
  pasteFileNotices: object;
  createdOn: null | Date;
}
