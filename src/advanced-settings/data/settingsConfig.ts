/**
 * Maps every known Advanced Settings key to a display category (and, for the
 * Content Blocks category, a subcategory) so the page can group settings into
 * labeled, collapsible sections.
 *
 * This file is purely about *presentation grouping*. The metadata that used to
 * live here — each field's input type and its enum options — now comes from the
 * backend Advanced Settings API (`type` and `options` on each setting). The
 * backend is the single source of truth for that; keeping it out of the
 * frontend avoids drift and silent data loss when the platform changes.
 *
 * Derived data (SETTINGS_CATEGORY_MAP, CATEGORY_ORDER, the Content Blocks
 * subcategory maps) is computed from this config in settingsCategories.ts.
 */

export interface FieldConfig {
  key: string;
  /** Only used for Content Blocks fields. */
  subcategory?: string;
}

export interface CategoryConfig {
  id: string;
  fields: FieldConfig[];
  /** Ordered list of subcategory labels. Only used for Content Blocks. */
  subcategoryOrder?: string[];
}

export const SETTINGS_CONFIG: CategoryConfig[] = [
  {
    id: 'General Setting',
    fields: [
      { key: 'displayName' },
      { key: 'displayCoursenumber' },
      { key: 'displayOrganization' },
      { key: 'maxStudentEnrollmentsAllowed' },
      { key: 'enableSubsectionGating' },
      { key: 'language' },
      { key: 'cohortConfig' },
      { key: 'courseEditMethod' },
      { key: 'entranceExamEnabled' },
      { key: 'entranceExamId' },
      { key: 'entranceExamMinimumScorePct' },
      { key: 'highlightsEnabledForMessaging' },
      { key: 'preRequisiteCourses' },
      { key: 'userPartitions' },
    ],
  },
  {
    id: 'Content Blocks',
    subcategoryOrder: ['Settings', 'Problems', 'Video'],
    fields: [
      // Settings
      { key: 'advancedModules', subcategory: 'Settings' },
      { key: 'ltiPassports', subcategory: 'Settings' },
      { key: 'allowUnsupportedXblocks', subcategory: 'Settings' },
      // Problems
      { key: 'maxAttempts', subcategory: 'Problems' },
      { key: 'rerandomize', subcategory: 'Problems' },
      { key: 'showanswer', subcategory: 'Problems' },
      { key: 'showResetButton', subcategory: 'Problems' },
      { key: 'forceOnFlexiblePeerOpenassessments', subcategory: 'Problems' },
      { key: 'useLatexCompiler', subcategory: 'Problems' },
      { key: 'matlabApiKey', subcategory: 'Problems' },
      // Video
      { key: 'videoSpeedOptimizations', subcategory: 'Video' },
      { key: 'videoSharingOptions', subcategory: 'Video' },
      { key: 'videoUploadPipeline', subcategory: 'Video' },
      { key: 'videoAutoAdvance', subcategory: 'Video' },
      { key: 'videoBumper', subcategory: 'Video' },
    ],
  },
  {
    id: 'Grading',
    fields: [
      { key: 'noGrade' },
      { key: 'dueDateDisplayFormat' },
      { key: 'remoteGradebook' },
      { key: 'minimumGradeCredit' },
      { key: 'showCorrectness' },
    ],
  },
  {
    id: 'Schedule',
    fields: [
      { key: 'due' },
      { key: 'relativeWeeksDue' },
      { key: 'selfPaced' },
    ],
  },
  {
    id: 'Certificates',
    fields: [
      { key: 'certNameLong' },
      { key: 'certNameShort' },
      { key: 'certHtmlViewOverrides' },
      { key: 'certHtmlViewEnabled' },
      { key: 'certificates' },
      { key: 'certificatesDisplayBehavior' },
      { key: 'certificatesShowBeforeEnd' },
    ],
  },
  {
    id: 'Enrollment Page',
    fields: [
      { key: 'cosmeticDisplayPrice' },
      { key: 'courseImage' },
      { key: 'advertisedStart' },
      { key: 'announcement' },
      { key: 'bannerImage' },
      { key: 'isNew' },
      { key: 'learningInfo' },
      { key: 'videoThumbnailImage' },
      { key: 'catalogVisibility' },
      { key: 'invitationOnly' },
      { key: 'courseSurveyName' },
      { key: 'courseSurveyRequired' },
      { key: 'courseVisibility' },
      { key: 'endOfCourseSurveyUrl' },
      { key: 'socialSharingUrl' },
    ],
  },
  {
    id: 'Pages & Resources',
    fields: [
      { key: 'allowPublicWikiAccess' },
      { key: 'disableProgressGraph' },
      { key: 'htmlTextbooks' },
      { key: 'showCalculator' },
      { key: 'teamsConfiguration' },
      { key: 'edxnotes' },
      { key: 'hideProgressTab' },
      { key: 'pdfTextbooks' },
      { key: 'discussionLink' },
      { key: 'discussionsSettings' },
    ],
  },
  {
    id: 'Special Exams',
    fields: [
      { key: 'allowProctoringOptOut' },
      { key: 'createZendeskTickets' },
      { key: 'enableProctoredExams' },
      { key: 'enableTimedExams' },
      { key: 'proctoringProvider' },
      { key: 'proctoringEscalationEmail' },
    ],
  },
  {
    id: 'Mobile',
    fields: [
      { key: 'mobileAvailable' },
    ],
  },
  {
    id: 'Instructors',
    fields: [
      { key: 'instructorInfo' },
    ],
  },
  {
    id: 'Legacy Discussion',
    fields: [
      { key: 'discussionBlackouts' },
      { key: 'allowAnonymous' },
      { key: 'allowAnonymousToPeers' },
      { key: 'discussionTopics' },
    ],
  },
  {
    id: 'Libraries',
    fields: [
      { key: 'upstream' },
      { key: 'upstreamDisplayName' },
      { key: 'upstreamVersion' },
      { key: 'upstreamVersionDeclined' },
      { key: 'downstreamCustomized' },
      { key: 'topLevelDownstreamParentKey' },
    ],
  },
  {
    id: 'Other',
    fields: [
      { key: 'courseWideCss' },
      { key: 'courseWideJs' },
      { key: 'daysEarlyForBeta' },
      { key: 'enrollmentDomain' },
      { key: 'staticAssetPath' },
      { key: 'giturl' },
      { key: 'enableCcx' },
      { key: 'ccxConnector' },
      { key: 'cssClass' },
      { key: 'otherCourseSettings' },
      { key: 'xqaKey' },
    ],
  },
];
