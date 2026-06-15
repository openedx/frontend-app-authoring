/**
 * Single source of truth for all Advanced Settings metadata.
 *
 * Each entry in SETTINGS_CONFIG defines a category and its fields.
 * Every field declares its key (as returned by the API), its input type,
 * and — for enum fields — the list of valid options.
 * Fields in the Content Blocks category also declare a subcategory.
 *
 * All derived data (SETTINGS_CATEGORY_MAP, ENUM_OPTIONS, BOOLEAN_KEYS, etc.)
 * is computed from this config in settingsCategories.ts and fieldTypes.ts.
 */

export const FIELD_TYPE = {
  BOOLEAN: 'boolean',
  NUMBER: 'number',
  ENUM: 'enum',
  STRING: 'string',
  JSON: 'json',
} as const;

export type FieldType = typeof FIELD_TYPE[keyof typeof FIELD_TYPE];

export interface EnumOption {
  value: string;
  /** English-only fallback. See JSDoc on ENUM_OPTIONS in fieldTypes.ts for usage warning. */
  label: string;
}

export interface FieldConfig {
  key: string;
  type: FieldType;
  enumOptions?: EnumOption[];
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
      { key: 'displayName', type: FIELD_TYPE.STRING },
      { key: 'displayCoursenumber', type: FIELD_TYPE.STRING },
      { key: 'displayOrganization', type: FIELD_TYPE.STRING },
      { key: 'maxStudentEnrollmentsAllowed', type: FIELD_TYPE.NUMBER },
      { key: 'enableSubsectionGating', type: FIELD_TYPE.BOOLEAN },
      { key: 'language', type: FIELD_TYPE.STRING },
      { key: 'cohortConfig', type: FIELD_TYPE.JSON },
      {
        key: 'courseEditMethod',
        type: FIELD_TYPE.ENUM,
        enumOptions: [
          { value: 'Studio', label: 'Studio' },
          { value: 'XML', label: 'XML' },
        ],
      },
      { key: 'entranceExamEnabled', type: FIELD_TYPE.BOOLEAN },
      { key: 'entranceExamId', type: FIELD_TYPE.STRING },
      { key: 'entranceExamMinimumScorePct', type: FIELD_TYPE.NUMBER },
      { key: 'highlightsEnabledForMessaging', type: FIELD_TYPE.BOOLEAN },
      { key: 'preRequisiteCourses', type: FIELD_TYPE.JSON },
      { key: 'userPartitions', type: FIELD_TYPE.JSON },
    ],
  },
  {
    id: 'Content Blocks',
    subcategoryOrder: ['Settings', 'Problems', 'Video'],
    fields: [
      // Settings
      { key: 'advancedModules', type: FIELD_TYPE.JSON, subcategory: 'Settings' },
      { key: 'ltiPassports', type: FIELD_TYPE.JSON, subcategory: 'Settings' },
      { key: 'allowUnsupportedXblocks', type: FIELD_TYPE.BOOLEAN, subcategory: 'Settings' },
      // Problems
      { key: 'maxAttempts', type: FIELD_TYPE.NUMBER, subcategory: 'Problems' },
      {
        key: 'rerandomize',
        type: FIELD_TYPE.ENUM,
        subcategory: 'Problems',
        enumOptions: [
          { value: 'never', label: 'Never' },
          { value: 'always', label: 'Always' },
          { value: 'onreset', label: 'On reset' },
          { value: 'per_student', label: 'Per student' },
        ],
      },
      {
        key: 'showanswer',
        type: FIELD_TYPE.ENUM,
        subcategory: 'Problems',
        enumOptions: [
          { value: 'always', label: 'Always' },
          { value: 'answered', label: 'Answered' },
          { value: 'attempted', label: 'Attempted' },
          { value: 'closed', label: 'Closed' },
          { value: 'finished', label: 'Finished' },
          { value: 'correct_or_past_due', label: 'Correct or past due' },
          { value: 'past_due', label: 'Past due' },
          { value: 'never', label: 'Never' },
          { value: 'after_attempts', label: 'After attempts' },
          { value: 'after_all_attempts', label: 'After all attempts' },
          { value: 'after_all_attempts_or_correct', label: 'After all attempts or correct' },
          { value: 'attempted_no_past_due', label: 'Attempted (no past due)' },
        ],
      },
      { key: 'showResetButton', type: FIELD_TYPE.BOOLEAN, subcategory: 'Problems' },
      { key: 'forceOnFlexiblePeerOpenassessments', type: FIELD_TYPE.BOOLEAN, subcategory: 'Problems' },
      { key: 'useLatexCompiler', type: FIELD_TYPE.BOOLEAN, subcategory: 'Problems' },
      { key: 'matlabApiKey', type: FIELD_TYPE.STRING, subcategory: 'Problems' },
      // Video
      { key: 'videoSpeedOptimizations', type: FIELD_TYPE.BOOLEAN, subcategory: 'Video' },
      {
        key: 'videoSharingOptions',
        type: FIELD_TYPE.ENUM,
        subcategory: 'Video',
        enumOptions: [
          { value: 'per-video', label: 'Per video' },
          { value: 'all-on', label: 'All on' },
          { value: 'all-off', label: 'All off' },
        ],
      },
      { key: 'videoUploadPipeline', type: FIELD_TYPE.JSON, subcategory: 'Video' },
      { key: 'videoAutoAdvance', type: FIELD_TYPE.BOOLEAN, subcategory: 'Video' },
      { key: 'videoBumper', type: FIELD_TYPE.JSON, subcategory: 'Video' },
    ],
  },
  {
    id: 'Grading',
    fields: [
      { key: 'noGrade', type: FIELD_TYPE.BOOLEAN },
      { key: 'dueDateDisplayFormat', type: FIELD_TYPE.STRING },
      { key: 'remoteGradebook', type: FIELD_TYPE.JSON },
      { key: 'minimumGradeCredit', type: FIELD_TYPE.NUMBER },
      {
        key: 'showCorrectness',
        type: FIELD_TYPE.ENUM,
        enumOptions: [
          { value: 'always', label: 'Always' },
          { value: 'never', label: 'Never' },
          { value: 'past_due', label: 'Past due' },
        ],
      },
    ],
  },
  {
    id: 'Schedule',
    fields: [
      { key: 'due', type: FIELD_TYPE.STRING },
      { key: 'relativeWeeksDue', type: FIELD_TYPE.NUMBER },
      { key: 'selfPaced', type: FIELD_TYPE.BOOLEAN },
    ],
  },
  {
    id: 'Certificates',
    fields: [
      { key: 'certNameLong', type: FIELD_TYPE.STRING },
      { key: 'certNameShort', type: FIELD_TYPE.STRING },
      { key: 'certHtmlViewOverrides', type: FIELD_TYPE.JSON },
      { key: 'certHtmlViewEnabled', type: FIELD_TYPE.BOOLEAN },
      { key: 'certificates', type: FIELD_TYPE.JSON },
      {
        key: 'certificatesDisplayBehavior',
        type: FIELD_TYPE.ENUM,
        enumOptions: [
          { value: 'end', label: 'End of course' },
          { value: 'early_no_info', label: 'Early (no info)' },
          { value: 'early_with_info', label: 'Early (with info)' },
        ],
      },
      { key: 'certificatesShowBeforeEnd', type: FIELD_TYPE.BOOLEAN },
    ],
  },
  {
    id: 'Enrollment Page',
    fields: [
      { key: 'cosmeticDisplayPrice', type: FIELD_TYPE.STRING },
      { key: 'courseImage', type: FIELD_TYPE.STRING },
      { key: 'advertisedStart', type: FIELD_TYPE.STRING },
      { key: 'announcement', type: FIELD_TYPE.STRING },
      { key: 'bannerImage', type: FIELD_TYPE.STRING },
      { key: 'isNew', type: FIELD_TYPE.BOOLEAN },
      { key: 'learningInfo', type: FIELD_TYPE.JSON },
      { key: 'videoThumbnailImage', type: FIELD_TYPE.STRING },
      {
        key: 'catalogVisibility',
        type: FIELD_TYPE.ENUM,
        enumOptions: [
          { value: 'both', label: 'Both (catalog and about page)' },
          { value: 'about', label: 'About page only' },
          { value: 'none', label: 'None' },
        ],
      },
      { key: 'invitationOnly', type: FIELD_TYPE.BOOLEAN },
      { key: 'courseSurveyName', type: FIELD_TYPE.STRING },
      { key: 'courseSurveyRequired', type: FIELD_TYPE.BOOLEAN },
      {
        key: 'courseVisibility',
        type: FIELD_TYPE.ENUM,
        enumOptions: [
          { value: 'private', label: 'Private' },
          { value: 'public', label: 'Public' },
          { value: 'public_outline', label: 'Public outline' },
        ],
      },
      { key: 'endOfCourseSurveyUrl', type: FIELD_TYPE.STRING },
      { key: 'socialSharingUrl', type: FIELD_TYPE.STRING },
    ],
  },
  {
    id: 'Pages & Resources',
    fields: [
      { key: 'allowPublicWikiAccess', type: FIELD_TYPE.BOOLEAN },
      { key: 'disableProgressGraph', type: FIELD_TYPE.BOOLEAN },
      { key: 'htmlTextbooks', type: FIELD_TYPE.JSON },
      { key: 'showCalculator', type: FIELD_TYPE.BOOLEAN },
      { key: 'teamsConfiguration', type: FIELD_TYPE.JSON },
      { key: 'edxnotes', type: FIELD_TYPE.BOOLEAN },
      { key: 'hideProgressTab', type: FIELD_TYPE.BOOLEAN },
      { key: 'pdfTextbooks', type: FIELD_TYPE.JSON },
      { key: 'discussionLink', type: FIELD_TYPE.STRING },
      { key: 'discussionsSettings', type: FIELD_TYPE.JSON },
    ],
  },
  {
    id: 'Special Exams',
    fields: [
      { key: 'allowProctoringOptOut', type: FIELD_TYPE.BOOLEAN },
      { key: 'createZendeskTickets', type: FIELD_TYPE.BOOLEAN },
      { key: 'enableProctoredExams', type: FIELD_TYPE.BOOLEAN },
      { key: 'enableTimedExams', type: FIELD_TYPE.BOOLEAN },
      { key: 'proctoringProvider', type: FIELD_TYPE.STRING },
      { key: 'proctoringEscalationEmail', type: FIELD_TYPE.STRING },
    ],
  },
  {
    id: 'Mobile',
    fields: [
      { key: 'mobileAvailable', type: FIELD_TYPE.BOOLEAN },
    ],
  },
  {
    id: 'Instructors',
    fields: [
      { key: 'instructorInfo', type: FIELD_TYPE.JSON },
    ],
  },
  {
    id: 'Legacy Discussion',
    fields: [
      { key: 'discussionBlackouts', type: FIELD_TYPE.JSON },
      { key: 'allowAnonymous', type: FIELD_TYPE.BOOLEAN },
      { key: 'allowAnonymousToPeers', type: FIELD_TYPE.BOOLEAN },
      { key: 'discussionTopics', type: FIELD_TYPE.JSON },
    ],
  },
  {
    id: 'Libraries',
    fields: [
      { key: 'upstream', type: FIELD_TYPE.STRING },
      { key: 'upstreamDisplayName', type: FIELD_TYPE.STRING },
      { key: 'upstreamVersion', type: FIELD_TYPE.NUMBER },
      { key: 'upstreamVersionDeclined', type: FIELD_TYPE.NUMBER },
      { key: 'downstreamCustomized', type: FIELD_TYPE.BOOLEAN },
      { key: 'topLevelDownstreamParentKey', type: FIELD_TYPE.STRING },
    ],
  },
  {
    id: 'Other',
    fields: [
      { key: 'courseWideCss', type: FIELD_TYPE.JSON },
      { key: 'courseWideJs', type: FIELD_TYPE.JSON },
      { key: 'daysEarlyForBeta', type: FIELD_TYPE.NUMBER },
      { key: 'enrollmentDomain', type: FIELD_TYPE.STRING },
      { key: 'staticAssetPath', type: FIELD_TYPE.STRING },
      { key: 'giturl', type: FIELD_TYPE.STRING },
      { key: 'enableCcx', type: FIELD_TYPE.BOOLEAN },
      { key: 'ccxConnector', type: FIELD_TYPE.JSON },
      { key: 'cssClass', type: FIELD_TYPE.STRING },
      { key: 'otherCourseSettings', type: FIELD_TYPE.JSON },
      { key: 'xqaKey', type: FIELD_TYPE.STRING },
    ],
  },
];
