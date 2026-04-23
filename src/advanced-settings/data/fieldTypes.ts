/**
 * Field type classification for all Advanced Settings.
 * Type is detected at runtime by getFieldType(key, value) based on typeof value + this enum map.
 *
 * BOOLEAN (Form.Switch):
 *   certHtmlViewEnabled, selfPaced, enableTimedExams, enableProctoredExams, showResetButton,
 *   mobileAvailable, invitationOnly, isNew, noGrade, highlightsEnabledForMessaging,
 *   allowUnsupportedXblocks, allowProctoringOptOut, createZendeskTickets, enableSubsectionGating,
 *   entranceExamEnabled, allowPublicWikiAccess, disableProgressGraph, showCalculator,
 *   hideProgressTab, edxnotes, videoAutoAdvance, videoSpeedOptimizations, useLatexCompiler,
 *   courseSurveyRequired, allowAnonymous, allowAnonymousToPeers, enableCcx,
 *   forceOnFlexiblePeerOpenassessments, downstreamCustomized, certificatesShowBeforeEnd
 *
 * NUMBER (text input, no letters):
 *   maxAttempts, maxStudentEnrollmentsAllowed, entranceExamMinimumScorePct, daysEarlyForBeta,
 *   relativeWeeksDue, minimumGradeCredit, upstreamVersion, upstreamVersionDeclined
 *
 * ENUM (<select> with fixed options — see ENUM_OPTIONS below):
 *   showanswer, rerandomize, catalogVisibility, courseVisibility, showCorrectness,
 *   videoSharingOptions, courseEditMethod, certificatesDisplayBehavior
 *
 * STRING (text input):
 *   displayName, displayCoursenumber, displayOrganization, giturl, staticAssetPath,
 *   announcement, courseSurveyName, proctoringEscalationEmail, proctoringProvider,
 *   matlabApiKey, xqaKey, cssClass, enrollmentDomain, cosmeticDisplayPrice,
 *   advertisedStart, socialSharingUrl, endOfCourseSurveyUrl, discussionLink, language,
 *   dueDateDisplayFormat, courseImage, bannerImage, videoThumbnailImage, entranceExamId,
 *   upstream, upstreamDisplayName, topLevelDownstreamParentKey, certNameLong, certNameShort, due
 *
 * JSON (CodeMirror editor with JSON syntax highlighting):
 *   advancedModules, cohortConfig, userPartitions, ltiPassports, discussionBlackouts,
 *   discussionTopics, discussionsSettings, teamsConfiguration, certHtmlViewOverrides,
 *   certificates, instructorInfo, htmlTextbooks, pdfTextbooks, videoBumper,
 *   videoUploadPipeline, courseWideCss, courseWideJs, learningInfo, preRequisiteCourses,
 *   remoteGradebook, otherCourseSettings, ccxConnector
 */
export const FIELD_TYPE = {
  BOOLEAN: 'boolean',
  NUMBER: 'number',
  ENUM: 'enum',
  STRING: 'string',
  JSON: 'json',
} as const;

export type FieldType = typeof FIELD_TYPE[keyof typeof FIELD_TYPE];

interface EnumOption {
  value: string;
  /** English-only fallback. See JSDoc on ENUM_OPTIONS for usage warning. */
  label: string;
}

/**
 * NOTE: The `label` field in each option is an English-only fallback used when
 * a value has no entry in ENUM_LABEL_MESSAGES (fieldTypeMessages.ts).
 * All current values are covered there. When adding new options, always add
 * a corresponding i18n message — never rely on `label` for user-visible text.
 */
export const ENUM_OPTIONS: Record<string, EnumOption[]> = {
  showanswer: [
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
  rerandomize: [
    { value: 'never', label: 'Never' },
    { value: 'always', label: 'Always' },
    { value: 'onreset', label: 'On reset' },
    { value: 'per_student', label: 'Per student' },
  ],
  catalogVisibility: [
    { value: 'both', label: 'Both (catalog and about page)' },
    { value: 'about', label: 'About page only' },
    { value: 'none', label: 'None' },
  ],
  courseVisibility: [
    { value: 'private', label: 'Private' },
    { value: 'public', label: 'Public' },
    { value: 'public_outline', label: 'Public outline' },
  ],
  showCorrectness: [
    { value: 'always', label: 'Always' },
    { value: 'never', label: 'Never' },
    { value: 'past_due', label: 'Past due' },
  ],
  videoSharingOptions: [
    { value: 'per-video', label: 'Per video' },
    { value: 'all-on', label: 'All on' },
    { value: 'all-off', label: 'All off' },
  ],
  courseEditMethod: [
    { value: 'Studio', label: 'Studio' },
    { value: 'XML', label: 'XML' },
  ],
  certificatesDisplayBehavior: [
    { value: 'end', label: 'End of course' },
    { value: 'early_no_info', label: 'Early (no info)' },
    { value: 'early_with_info', label: 'Early (with info)' },
  ],
};

/**
 * Explicit key → type overrides.
 * Used when the runtime value could be null/empty but the field has a known type.
 */
const NUMBER_KEYS = new Set([
  'maxAttempts', 'maxStudentEnrollmentsAllowed', 'entranceExamMinimumScorePct',
  'daysEarlyForBeta', 'relativeWeeksDue', 'minimumGradeCredit',
  'upstreamVersion', 'upstreamVersionDeclined',
]);

const BOOLEAN_KEYS = new Set([
  'certHtmlViewEnabled', 'selfPaced', 'enableTimedExams', 'enableProctoredExams',
  'showResetButton', 'mobileAvailable', 'invitationOnly', 'isNew', 'noGrade',
  'highlightsEnabledForMessaging', 'allowUnsupportedXblocks', 'allowProctoringOptOut',
  'createZendeskTickets', 'enableSubsectionGating', 'entranceExamEnabled',
  'allowPublicWikiAccess', 'disableProgressGraph', 'showCalculator', 'hideProgressTab',
  'edxnotes', 'videoAutoAdvance', 'videoSpeedOptimizations', 'useLatexCompiler',
  'courseSurveyRequired', 'allowAnonymous', 'allowAnonymousToPeers', 'enableCcx',
  'forceOnFlexiblePeerOpenassessments', 'downstreamCustomized', 'certificatesShowBeforeEnd',
]);

/**
 * Returns the field type for a given setting key and its current value.
 * Key-based overrides are checked first to handle null/empty API values correctly.
 */
export function getFieldType(key: string, value: unknown): FieldType {
  if (BOOLEAN_KEYS.has(key)) { return FIELD_TYPE.BOOLEAN; }
  if (NUMBER_KEYS.has(key)) { return FIELD_TYPE.NUMBER; }
  if (ENUM_OPTIONS[key]) { return FIELD_TYPE.ENUM; }
  if (typeof value === 'boolean') { return FIELD_TYPE.BOOLEAN; }
  if (typeof value === 'number') { return FIELD_TYPE.NUMBER; }
  if (Array.isArray(value) || (typeof value === 'object' && value !== null)) { return FIELD_TYPE.JSON; }
  return FIELD_TYPE.STRING;
}

/**
 * Serializes a native value back to a JSON-compatible string
 * that can be stored in editedSettings and processed by parseArrayOrObjectValues.
 */
export function serializeValue(nativeValue: unknown, fieldType: FieldType): string {
  if (fieldType === FIELD_TYPE.BOOLEAN) { return String(nativeValue); }
  if (fieldType === FIELD_TYPE.NUMBER) { return String(nativeValue); }
  if (fieldType === FIELD_TYPE.ENUM || fieldType === FIELD_TYPE.STRING) {
    return JSON.stringify(nativeValue);
  }
  return nativeValue as string; // JSON type — already a string
}
