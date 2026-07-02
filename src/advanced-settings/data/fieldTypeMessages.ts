import { defineMessages } from '@edx/frontend-platform/i18n';

// ── Enum option labels ────────────────────────────────────────────────────────

/**
 * i18n message descriptors for all enum option display labels.
 * Shared labels (e.g. 'Always', 'Never') are defined once and reused
 * across multiple fields in ENUM_LABEL_MESSAGES below.
 */
const enumOptionMessages = defineMessages({
  always: {
    id: 'course-authoring.advanced-settings.enum.always',
    defaultMessage: 'Always',
    description: 'Option label meaning the setting applies at all times (used in Show Answer, Show Correctness, etc.)',
  },
  answered: {
    id: 'course-authoring.advanced-settings.enum.answered',
    defaultMessage: 'Answered',
    description: 'Option label for Show Answer: show the answer after the learner has submitted a response',
  },
  attempted: {
    id: 'course-authoring.advanced-settings.enum.attempted',
    defaultMessage: 'Attempted',
    description: 'Option label for Show Answer: show the answer after the learner has attempted the problem',
  },
  closed: {
    id: 'course-authoring.advanced-settings.enum.closed',
    defaultMessage: 'Closed',
    description: 'Option label for Show Answer: show the answer after the problem due date has passed',
  },
  finished: {
    id: 'course-authoring.advanced-settings.enum.finished',
    defaultMessage: 'Finished',
    description:
      'Option label for Show Answer: show the answer after the learner has used all attempts or the problem is past due',
  },
  correctOrPastDue: {
    id: 'course-authoring.advanced-settings.enum.correct-or-past-due',
    defaultMessage: 'Correct or past due',
    description:
      'Option label for Show Answer: show the answer once the learner answers correctly or the due date passes',
  },
  pastDue: {
    id: 'course-authoring.advanced-settings.enum.past-due',
    defaultMessage: 'Past due',
    description: 'Option label meaning the setting applies only after the due date has passed',
  },
  never: {
    id: 'course-authoring.advanced-settings.enum.never',
    defaultMessage: 'Never',
    description: 'Option label meaning the setting never applies (used in Show Answer, Show Correctness, etc.)',
  },
  afterAttempts: {
    id: 'course-authoring.advanced-settings.enum.after-attempts',
    defaultMessage: 'After attempts',
    description: 'Option label for Show Answer: show the answer after the learner has used a set number of attempts',
  },
  afterAllAttempts: {
    id: 'course-authoring.advanced-settings.enum.after-all-attempts',
    defaultMessage: 'After all attempts',
    description: 'Option label for Show Answer: show the answer only after the learner has exhausted all attempts',
  },
  afterAllAttemptsOrCorrect: {
    id: 'course-authoring.advanced-settings.enum.after-all-attempts-or-correct',
    defaultMessage: 'After all attempts or correct',
    description:
      'Option label for Show Answer: show the answer after all attempts are used or the learner answers correctly',
  },
  attemptedNoPastDue: {
    id: 'course-authoring.advanced-settings.enum.attempted-no-past-due',
    defaultMessage: 'Attempted (no past due)',
    description: 'Option label for Show Answer: show the answer after an attempt, but not based on the due date',
  },
  onReset: {
    id: 'course-authoring.advanced-settings.enum.on-reset',
    defaultMessage: 'On reset',
    description: 'Option label for Randomization: randomize the problem each time the learner resets it',
  },
  perStudent: {
    id: 'course-authoring.advanced-settings.enum.per-student',
    defaultMessage: 'Per student',
    description: 'Option label for Randomization: use a different randomization seed for each student',
  },
  bothCatalogAndAbout: {
    id: 'course-authoring.advanced-settings.enum.both-catalog-and-about',
    defaultMessage: 'Both (catalog and about page)',
    description: 'Option label for Catalog Visibility: show the course in both the course catalog and the about page',
  },
  aboutPageOnly: {
    id: 'course-authoring.advanced-settings.enum.about-page-only',
    defaultMessage: 'About page only',
    description: 'Option label for Catalog Visibility: show the course only on its about page, not in the catalog',
  },
  none: {
    id: 'course-authoring.advanced-settings.enum.none',
    defaultMessage: 'None',
    description: 'Option label meaning the course is hidden from both the catalog and the about page',
  },
  private: {
    id: 'course-authoring.advanced-settings.enum.private',
    defaultMessage: 'Private',
    description: 'Option label for Course Visibility: the course is not visible to unenrolled learners',
  },
  public: {
    id: 'course-authoring.advanced-settings.enum.public',
    defaultMessage: 'Public',
    description: 'Option label for Course Visibility: the course content is fully visible to all learners',
  },
  publicOutline: {
    id: 'course-authoring.advanced-settings.enum.public-outline',
    defaultMessage: 'Public outline',
    description: 'Option label for Course Visibility: only the course outline is visible to unenrolled learners',
  },
  perVideo: {
    id: 'course-authoring.advanced-settings.enum.per-video',
    defaultMessage: 'Per video',
    description: 'Option label for Video Sharing: sharing settings are configured individually per video',
  },
  allOn: {
    id: 'course-authoring.advanced-settings.enum.all-on',
    defaultMessage: 'All on',
    description: 'Option label for Video Sharing: sharing is enabled for all videos in the course',
  },
  allOff: {
    id: 'course-authoring.advanced-settings.enum.all-off',
    defaultMessage: 'All off',
    description: 'Option label for Video Sharing: sharing is disabled for all videos in the course',
  },
  studio: {
    id: 'course-authoring.advanced-settings.enum.studio',
    defaultMessage: 'Studio',
    description: 'Option label for Course Edit Method: the course is edited using Studio (the visual editor)',
  },
  xml: {
    id: 'course-authoring.advanced-settings.enum.xml',
    defaultMessage: 'XML',
    description: 'Option label for Course Edit Method: the course is edited directly as XML files',
  },
  endOfCourse: {
    id: 'course-authoring.advanced-settings.enum.end-of-course',
    defaultMessage: 'End of course',
    description: 'Option label for Certificates Display Behavior: certificates are displayed after the course ends',
  },
  earlyNoInfo: {
    id: 'course-authoring.advanced-settings.enum.early-no-info',
    defaultMessage: 'Early (no info)',
    description:
      'Option label for Certificates Display Behavior: certificates are displayed early with no additional information',
  },
  earlyWithInfo: {
    id: 'course-authoring.advanced-settings.enum.early-with-info',
    defaultMessage: 'Early (with info)',
    description:
      'Option label for Certificates Display Behavior: certificates are displayed early with additional information shown to learners',
  },
});

/**
 * Maps each enum field name and option value to its i18n message descriptor.
 * Used by EnumInput to render localized option labels.
 * Keys match the `value` field of each option in ENUM_OPTIONS (fieldTypes.ts).
 */
export const ENUM_LABEL_MESSAGES: Record<string, Record<string, { id: string; defaultMessage: string; }>> = {
  showanswer: {
    always: enumOptionMessages.always,
    answered: enumOptionMessages.answered,
    attempted: enumOptionMessages.attempted,
    closed: enumOptionMessages.closed,
    finished: enumOptionMessages.finished,
    correct_or_past_due: enumOptionMessages.correctOrPastDue,
    past_due: enumOptionMessages.pastDue,
    never: enumOptionMessages.never,
    after_attempts: enumOptionMessages.afterAttempts,
    after_all_attempts: enumOptionMessages.afterAllAttempts,
    after_all_attempts_or_correct: enumOptionMessages.afterAllAttemptsOrCorrect,
    attempted_no_past_due: enumOptionMessages.attemptedNoPastDue,
  },
  rerandomize: {
    never: enumOptionMessages.never,
    always: enumOptionMessages.always,
    onreset: enumOptionMessages.onReset,
    per_student: enumOptionMessages.perStudent,
  },
  catalogVisibility: {
    both: enumOptionMessages.bothCatalogAndAbout,
    about: enumOptionMessages.aboutPageOnly,
    none: enumOptionMessages.none,
  },
  courseVisibility: {
    private: enumOptionMessages.private,
    public: enumOptionMessages.public,
    public_outline: enumOptionMessages.publicOutline,
  },
  showCorrectness: {
    always: enumOptionMessages.always,
    never: enumOptionMessages.never,
    past_due: enumOptionMessages.pastDue,
  },
  videoSharingOptions: {
    'per-video': enumOptionMessages.perVideo,
    'all-on': enumOptionMessages.allOn,
    'all-off': enumOptionMessages.allOff,
  },
  courseEditMethod: {
    Studio: enumOptionMessages.studio,
    XML: enumOptionMessages.xml,
  },
  certificatesDisplayBehavior: {
    end: enumOptionMessages.endOfCourse,
    early_no_info: enumOptionMessages.earlyNoInfo,
    early_with_info: enumOptionMessages.earlyWithInfo,
  },
};

// ── Input placeholder text ────────────────────────────────────────────────────

/**
 * i18n message descriptors for input placeholder text.
 * Keys match the setting field names returned by the API (camelCase).
 * Used by SettingCard to render localized placeholders in StringInput and NumberInput.
 */
export const FIELD_PLACEHOLDER_MESSAGES = defineMessages({
  // STRING fields
  displayName: {
    id: 'course-authoring.advanced-settings.placeholder.display-name',
    defaultMessage: 'e.g. Introduction to Biology',
    description: 'Placeholder for the Course Display Name override field in Advanced Settings',
  },
  displayCoursenumber: {
    id: 'course-authoring.advanced-settings.placeholder.display-coursenumber',
    defaultMessage: 'e.g. BIO101',
    description: 'Placeholder for the Course Number override field in Advanced Settings',
  },
  displayOrganization: {
    id: 'course-authoring.advanced-settings.placeholder.display-organization',
    defaultMessage: 'e.g. University of California',
    description: 'Placeholder for the Course Organization override field in Advanced Settings',
  },
  giturl: {
    id: 'course-authoring.advanced-settings.placeholder.giturl',
    defaultMessage: 'e.g. https://github.com/org/course-repo',
    description: 'Placeholder for the Git URL field used when Course Edit Method is set to XML',
  },
  staticAssetPath: {
    id: 'course-authoring.advanced-settings.placeholder.static-asset-path',
    defaultMessage: 'e.g. /static/',
    description: 'Placeholder for the Static Asset Path field in Advanced Settings',
  },
  announcement: {
    id: 'course-authoring.advanced-settings.placeholder.announcement',
    defaultMessage: 'e.g. 2026-01-15',
    description: 'Placeholder for the Announcement date field in Advanced Settings (ISO date format)',
  },
  courseSurveyName: {
    id: 'course-authoring.advanced-settings.placeholder.course-survey-name',
    defaultMessage: 'e.g. pre_course_survey',
    description: 'Placeholder for the Course Survey Name field in Advanced Settings',
  },
  proctoringEscalationEmail: {
    id: 'course-authoring.advanced-settings.placeholder.proctoring-escalation-email',
    defaultMessage: 'e.g. proctoring@university.edu',
    description: 'Placeholder for the Proctoring Escalation Email field in Advanced Settings',
  },
  proctoringProvider: {
    id: 'course-authoring.advanced-settings.placeholder.proctoring-provider',
    defaultMessage: 'e.g. proctortrack',
    description: 'Placeholder for the Proctoring Provider field in Advanced Settings',
  },
  matlabApiKey: {
    id: 'course-authoring.advanced-settings.placeholder.matlab-api-key',
    defaultMessage: 'Enter your MATLAB API key',
    description: 'Placeholder for the MATLAB API Key field in Advanced Settings',
  },
  xqaKey: {
    id: 'course-authoring.advanced-settings.placeholder.xqa-key',
    defaultMessage: 'Enter your XQA key',
    description: 'Placeholder for the XQA Key field in Advanced Settings',
  },
  cssClass: {
    id: 'course-authoring.advanced-settings.placeholder.css-class',
    defaultMessage: 'e.g. biology-course',
    description: 'Placeholder for the CSS Class field used to apply custom styling to the course',
  },
  enrollmentDomain: {
    id: 'course-authoring.advanced-settings.placeholder.enrollment-domain',
    defaultMessage: 'e.g. university.edu',
    description: 'Placeholder for the Enrollment Domain field in Advanced Settings',
  },
  cosmeticDisplayPrice: {
    id: 'course-authoring.advanced-settings.placeholder.cosmetic-display-price',
    defaultMessage: 'e.g. 49.99',
    description: 'Placeholder for the Cosmetic Display Price field shown on the course about page',
  },
  advertisedStart: {
    id: 'course-authoring.advanced-settings.placeholder.advertised-start',
    defaultMessage: 'e.g. Winter 2026',
    description: 'Placeholder for the Advertised Start date field shown to learners on the about page',
  },
  socialSharingUrl: {
    id: 'course-authoring.advanced-settings.placeholder.social-sharing-url',
    defaultMessage: 'e.g. https://example.com/share',
    description: 'Placeholder for the Social Sharing URL field in Advanced Settings',
  },
  endOfCourseSurveyUrl: {
    id: 'course-authoring.advanced-settings.placeholder.end-of-course-survey-url',
    defaultMessage: 'e.g. https://survey.example.com',
    description: 'Placeholder for the End of Course Survey URL field in Advanced Settings',
  },
  discussionLink: {
    id: 'course-authoring.advanced-settings.placeholder.discussion-link',
    defaultMessage: 'e.g. https://forum.example.com',
    description: 'Placeholder for the Discussion Link field used to override the default discussion forum URL',
  },
  language: {
    id: 'course-authoring.advanced-settings.placeholder.language',
    defaultMessage: 'e.g. en',
    description: 'Placeholder for the Language field in Advanced Settings (ISO 639-1 language code)',
  },
  dueDateDisplayFormat: {
    id: 'course-authoring.advanced-settings.placeholder.due-date-display-format',
    defaultMessage: 'e.g. %m-%d-%Y',
    description: 'Placeholder for the Due Date Display Format field in Advanced Settings (strftime format)',
  },
  courseImage: {
    id: 'course-authoring.advanced-settings.placeholder.course-image',
    defaultMessage: 'e.g. course_image.jpg',
    description: 'Placeholder for the Course Image filename field in Advanced Settings',
  },
  bannerImage: {
    id: 'course-authoring.advanced-settings.placeholder.banner-image',
    defaultMessage: 'e.g. banner_image.jpg',
    description: 'Placeholder for the Banner Image filename field in Advanced Settings',
  },
  videoThumbnailImage: {
    id: 'course-authoring.advanced-settings.placeholder.video-thumbnail-image',
    defaultMessage: 'e.g. thumbnail.jpg',
    description: 'Placeholder for the Video Thumbnail Image filename field in Advanced Settings',
  },
  entranceExamId: {
    id: 'course-authoring.advanced-settings.placeholder.entrance-exam-id',
    defaultMessage: 'e.g. block-v1:Org+Course+Run+type@problem+block@id',
    description: 'Placeholder for the Entrance Exam ID field in Advanced Settings (Open edX block key format)',
  },
  upstream: {
    id: 'course-authoring.advanced-settings.placeholder.upstream',
    defaultMessage: 'e.g. lib:org:library-slug',
    description: 'Placeholder for the Upstream library key field in Advanced Settings',
  },
  upstreamDisplayName: {
    id: 'course-authoring.advanced-settings.placeholder.upstream-display-name',
    defaultMessage: 'e.g. My Content Library',
    description: 'Placeholder for the Upstream Display Name field in Advanced Settings',
  },
  topLevelDownstreamParentKey: {
    id: 'course-authoring.advanced-settings.placeholder.top-level-downstream-parent-key',
    defaultMessage: 'e.g. block-v1:Org+Course+Run+type@vertical+block@id',
    description:
      'Placeholder for the Top-Level Downstream Parent Key field in Advanced Settings (Open edX block key format)',
  },
  certNameLong: {
    id: 'course-authoring.advanced-settings.placeholder.cert-name-long',
    defaultMessage: 'e.g. Certificate of Completion',
    description: 'Placeholder for the Certificate Long Name field shown on issued certificates',
  },
  certNameShort: {
    id: 'course-authoring.advanced-settings.placeholder.cert-name-short',
    defaultMessage: 'e.g. Certificate',
    description: 'Placeholder for the Certificate Short Name field used in certificate-related UI',
  },
  due: {
    id: 'course-authoring.advanced-settings.placeholder.due',
    defaultMessage: 'e.g. 2026-12-31T00:00:00Z',
    description: 'Placeholder for the Due Date field in Advanced Settings (ISO 8601 datetime format)',
  },
  // NUMBER fields
  maxAttempts: {
    id: 'course-authoring.advanced-settings.placeholder.max-attempts',
    defaultMessage: 'e.g. 3',
    description: 'Placeholder for the Maximum Attempts field controlling how many times a learner can submit a problem',
  },
  maxStudentEnrollmentsAllowed: {
    id: 'course-authoring.advanced-settings.placeholder.max-student-enrollments-allowed',
    defaultMessage: 'e.g. 500',
    description: 'Placeholder for the Maximum Student Enrollments Allowed field in Advanced Settings',
  },
  entranceExamMinimumScorePct: {
    id: 'course-authoring.advanced-settings.placeholder.entrance-exam-minimum-score-pct',
    defaultMessage: 'e.g. 65',
    description: 'Placeholder for the Entrance Exam Minimum Score Percentage field in Advanced Settings',
  },
  daysEarlyForBeta: {
    id: 'course-authoring.advanced-settings.placeholder.days-early-for-beta',
    defaultMessage: 'e.g. 7',
    description: 'Placeholder for the Days Early for Beta field controlling early access for beta testers',
  },
  relativeWeeksDue: {
    id: 'course-authoring.advanced-settings.placeholder.relative-weeks-due',
    defaultMessage: 'e.g. 4',
    description: 'Placeholder for the Relative Weeks Due field used for self-paced courses',
  },
  minimumGradeCredit: {
    id: 'course-authoring.advanced-settings.placeholder.minimum-grade-credit',
    defaultMessage: 'e.g. 0.70',
    description: 'Placeholder for the Minimum Grade for Credit field (decimal between 0 and 1)',
  },
  upstreamVersion: {
    id: 'course-authoring.advanced-settings.placeholder.upstream-version',
    defaultMessage: 'e.g. 1',
    description: 'Placeholder for the Upstream Version field tracking the library content version',
  },
  upstreamVersionDeclined: {
    id: 'course-authoring.advanced-settings.placeholder.upstream-version-declined',
    defaultMessage: 'e.g. 1',
    description: 'Placeholder for the Upstream Version Declined field tracking a declined library content update',
  },
});
