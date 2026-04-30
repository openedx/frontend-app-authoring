/**
 * Maps each advanced setting key (camelCase, as returned by the API)
 * to its display category.
 *
 * Settings not present in this map will fall into the "Other" category.
 */
export const SETTINGS_CATEGORY_MAP: Record<string, string> = {
  // ── General Setting ──────────────────────────────────────────────────────
  displayName: 'General Setting',
  displayCoursenumber: 'General Setting',
  displayOrganization: 'General Setting',
  maxStudentEnrollmentsAllowed: 'General Setting',
  enableSubsectionGating: 'General Setting',
  language: 'General Setting',
  cohortConfig: 'General Setting',
  courseEditMethod: 'General Setting',
  entranceExamEnabled: 'General Setting',
  entranceExamId: 'General Setting',
  entranceExamMinimumScorePct: 'General Setting',
  highlightsEnabledForMessaging: 'General Setting',
  preRequisiteCourses: 'General Setting',
  userPartitions: 'General Setting',

  // ── Content Blocks ────────────────────────────────────────────────────────
  advancedModules: 'Content Blocks',
  useLatexCompiler: 'Content Blocks',
  videoSpeedOptimizations: 'Content Blocks',
  forceOnFlexiblePeerOpenassessments: 'Content Blocks',
  ltiPassports: 'Content Blocks',
  matlabApiKey: 'Content Blocks',
  maxAttempts: 'Content Blocks',
  rerandomize: 'Content Blocks',
  showanswer: 'Content Blocks',
  showResetButton: 'Content Blocks',
  videoSharingOptions: 'Content Blocks',
  videoUploadPipeline: 'Content Blocks',
  videoAutoAdvance: 'Content Blocks',
  videoBumper: 'Content Blocks',
  allowUnsupportedXblocks: 'Content Blocks',

  // ── Grading ───────────────────────────────────────────────────────────────
  noGrade: 'Grading',
  dueDateDisplayFormat: 'Grading',
  remoteGradebook: 'Grading',
  minimumGradeCredit: 'Grading',
  showCorrectness: 'Grading',

  // ── Schedule ──────────────────────────────────────────────────────────────
  due: 'Schedule',
  relativeWeeksDue: 'Schedule',
  selfPaced: 'Schedule',

  // ── Certificates ─────────────────────────────────────────────────────────
  certNameLong: 'Certificates',
  certNameShort: 'Certificates',
  certHtmlViewOverrides: 'Certificates',
  certHtmlViewEnabled: 'Certificates',
  certificates: 'Certificates',
  certificatesDisplayBehavior: 'Certificates',
  certificatesShowBeforeEnd: 'Certificates',

  // ── Enrollment Page ───────────────────────────────────────────────────────
  cosmeticDisplayPrice: 'Enrollment Page',
  courseImage: 'Enrollment Page',
  advertisedStart: 'Enrollment Page',
  announcement: 'Enrollment Page',
  bannerImage: 'Enrollment Page',
  isNew: 'Enrollment Page',
  learningInfo: 'Enrollment Page',
  videoThumbnailImage: 'Enrollment Page',
  catalogVisibility: 'Enrollment Page',
  invitationOnly: 'Enrollment Page',
  courseSurveyName: 'Enrollment Page',
  courseSurveyRequired: 'Enrollment Page',
  courseVisibility: 'Enrollment Page',
  endOfCourseSurveyUrl: 'Enrollment Page',
  socialSharingUrl: 'Enrollment Page',

  // ── Pages & Resources ─────────────────────────────────────────────────────
  allowPublicWikiAccess: 'Pages & Resources',
  disableProgressGraph: 'Pages & Resources',
  htmlTextbooks: 'Pages & Resources',
  showCalculator: 'Pages & Resources',
  teamsConfiguration: 'Pages & Resources',
  edxnotes: 'Pages & Resources',
  hideProgressTab: 'Pages & Resources',
  pdfTextbooks: 'Pages & Resources',
  discussionLink: 'Pages & Resources',
  discussionsSettings: 'Pages & Resources',

  // ── Special Exams ─────────────────────────────────────────────────────────
  allowProctoringOptOut: 'Special Exams',
  createZendeskTickets: 'Special Exams',
  enableProctoredExams: 'Special Exams',
  enableTimedExams: 'Special Exams',
  proctoringProvider: 'Special Exams',
  proctoringEscalationEmail: 'Special Exams',

  // ── Mobile ────────────────────────────────────────────────────────────────
  mobileAvailable: 'Mobile',

  // ── Instructors ───────────────────────────────────────────────────────────
  instructorInfo: 'Instructors',

  // ── Legacy Discussion ─────────────────────────────────────────────────────
  discussionBlackouts: 'Legacy Discussion',
  allowAnonymous: 'Legacy Discussion',
  allowAnonymousToPeers: 'Legacy Discussion',
  discussionTopics: 'Legacy Discussion',

  // ── Libraries ─────────────────────────────────────────────────────────────
  upstream: 'Libraries',
  upstreamDisplayName: 'Libraries',
  upstreamVersion: 'Libraries',
  upstreamVersionDeclined: 'Libraries',
  downstreamCustomized: 'Libraries',
  topLevelDownstreamParentKey: 'Libraries',

  // ── Other ─────────────────────────────────────────────────────────────────
  courseWideCss: 'Other',
  courseWideJs: 'Other',
  daysEarlyForBeta: 'Other',
  enrollmentDomain: 'Other',
  staticAssetPath: 'Other',
  giturl: 'Other',
  enableCcx: 'Other',
  ccxConnector: 'Other',
  cssClass: 'Other',
  otherCourseSettings: 'Other',
  xqaKey: 'Other',
};

/**
 * Display order for categories in the UI.
 * Categories not listed here will appear after these, alphabetically.
 */
export const CATEGORY_ORDER: string[] = [
  'General Setting',
  'Content Blocks',
  'Grading',
  'Schedule',
  'Certificates',
  'Enrollment Page',
  'Pages & Resources',
  'Special Exams',
  'Mobile',
  'Instructors',
  'Legacy Discussion',
  'Libraries',
  'Other',
];

/**
 * Fallback category for settings not present in SETTINGS_CATEGORY_MAP.
 */
export const UNCATEGORIZED = 'Other';

export const CATEGORY_GENERAL_SETTING = 'General Setting';
export const CATEGORY_CONTENT_BLOCKS = 'Content Blocks';
export const CATEGORY_GRADING = 'Grading';
export const CATEGORY_SCHEDULE = 'Schedule';
export const CATEGORY_CERTIFICATES = 'Certificates';
export const CATEGORY_ENROLLMENT_PAGE = 'Enrollment Page';
export const CATEGORY_PAGES_AND_RESOURCES = 'Pages & Resources';
export const CATEGORY_SPECIAL_EXAMS = 'Special Exams';
export const CATEGORY_MOBILE = 'Mobile';
export const CATEGORY_INSTRUCTORS = 'Instructors';
export const CATEGORY_LEGACY_DISCUSSION = 'Legacy Discussion';
export const CATEGORY_LIBRARIES = 'Libraries';
export const CATEGORY_OTHER = 'Other';

/**
 * Subcategory map for Content Blocks settings.
 * Maps each setting key to its subcategory label.
 */
export const CONTENT_BLOCKS_SUBCATEGORY_MAP: Record<string, string> = {
  // Settings
  advancedModules: 'Settings',
  ltiPassports: 'Settings',
  allowUnsupportedXblocks: 'Settings',

  // Problems
  maxAttempts: 'Problems',
  rerandomize: 'Problems',
  showanswer: 'Problems',
  showResetButton: 'Problems',
  forceOnFlexiblePeerOpenassessments: 'Problems',
  useLatexCompiler: 'Problems',
  matlabApiKey: 'Problems',

  // Video
  videoSpeedOptimizations: 'Video',
  videoSharingOptions: 'Video',
  videoUploadPipeline: 'Video',
  videoAutoAdvance: 'Video',
  videoBumper: 'Video',
};

export const CONTENT_BLOCKS_SUBCATEGORY_ORDER: string[] = ['Settings', 'Problems', 'Video'];
