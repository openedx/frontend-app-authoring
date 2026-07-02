import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  // ── CourseDisplayOverrides ─────────────────────────────────────────────────
  courseDisplayOverridesLabel: {
    id: 'course-authoring.advanced-settings.settings-section.course-display-overrides.label',
    defaultMessage: 'Course Display Overrides',
    description: 'Label for the Course Display Overrides toggle section in Advanced Settings',
  },
  courseDisplayOverridesInfoAlt: {
    id: 'course-authoring.advanced-settings.settings-section.course-display-overrides.info-alt',
    defaultMessage: 'More information about Course Display Overrides',
    description: 'Alt text for the info icon button that opens the Course Display Overrides help popup',
  },
  courseDisplayOverridesInfoText: {
    id: 'course-authoring.advanced-settings.settings-section.course-display-overrides.info-text',
    defaultMessage: 'Override the default display values for Course Name, Course Number, and Course Organization shown to learners. Leave empty to use the values set during course creation.',
    description: 'Explanatory text shown in the info popup for the Course Display Overrides section',
  },
  courseDisplayOverridesBlockedMessage: {
    id: 'course-authoring.advanced-settings.settings-section.course-display-overrides.blocked-message',
    defaultMessage: 'These fields have content. Clear all three fields to disable Course Display Overrides.',
    description: 'Warning message shown when the course author tries to disable Course Display Overrides but one or more fields still have content',
  },

  // ── Category names (section headers) ──────────────────────────────────────
  categoryGeneralSetting: {
    id: 'course-authoring.advanced-settings.category.general-setting',
    defaultMessage: 'General Setting',
    description: 'Header label for the General Setting section on the Advanced Settings page',
  },
  categoryContentBlocks: {
    id: 'course-authoring.advanced-settings.category.content-blocks',
    defaultMessage: 'Content Blocks',
    description: 'Header label for the Content Blocks section on the Advanced Settings page',
  },
  categoryGrading: {
    id: 'course-authoring.advanced-settings.category.grading',
    defaultMessage: 'Grading',
    description: 'Header label for the Grading section on the Advanced Settings page',
  },
  categorySchedule: {
    id: 'course-authoring.advanced-settings.category.schedule',
    defaultMessage: 'Schedule',
    description: 'Header label for the Schedule section on the Advanced Settings page',
  },
  categoryCertificates: {
    id: 'course-authoring.advanced-settings.category.certificates',
    defaultMessage: 'Certificates',
    description: 'Header label for the Certificates section on the Advanced Settings page',
  },
  categoryEnrollmentPage: {
    id: 'course-authoring.advanced-settings.category.enrollment-page',
    defaultMessage: 'Enrollment Page',
    description: 'Header label for the Enrollment Page section on the Advanced Settings page',
  },
  categoryPagesAndResources: {
    id: 'course-authoring.advanced-settings.category.pages-and-resources',
    defaultMessage: 'Pages & Resources',
    description: 'Header label for the Pages & Resources section on the Advanced Settings page',
  },
  categorySpecialExams: {
    id: 'course-authoring.advanced-settings.category.special-exams',
    defaultMessage: 'Special Exams',
    description: 'Header label for the Special Exams section on the Advanced Settings page',
  },
  categoryMobile: {
    id: 'course-authoring.advanced-settings.category.mobile',
    defaultMessage: 'Mobile',
    description: 'Header label for the Mobile section on the Advanced Settings page',
  },
  categoryInstructors: {
    id: 'course-authoring.advanced-settings.category.instructors',
    defaultMessage: 'Instructors',
    description: 'Header label for the Instructors section on the Advanced Settings page',
  },
  categoryLegacyDiscussion: {
    id: 'course-authoring.advanced-settings.category.legacy-discussion',
    defaultMessage: 'Legacy Discussion',
    description: 'Header label for the Legacy Discussion section on the Advanced Settings page',
  },
  categoryLibraries: {
    id: 'course-authoring.advanced-settings.category.libraries',
    defaultMessage: 'Libraries',
    description: 'Header label for the Libraries section on the Advanced Settings page',
  },
  categoryOther: {
    id: 'course-authoring.advanced-settings.category.other',
    defaultMessage: 'Other',
    description: 'Header label for the Other (uncategorized) section on the Advanced Settings page',
  },

  // ── Subcategory names (Content Blocks sub-headers) ─────────────────────────
  subcategorySettings: {
    id: 'course-authoring.advanced-settings.subcategory.settings',
    defaultMessage: 'Settings',
    description: 'Sub-header label for the Settings group inside the Content Blocks section',
  },
  subcategoryProblems: {
    id: 'course-authoring.advanced-settings.subcategory.problems',
    defaultMessage: 'Problems',
    description: 'Sub-header label for the Problems group inside the Content Blocks section',
  },
  subcategoryVideo: {
    id: 'course-authoring.advanced-settings.subcategory.video',
    defaultMessage: 'Video',
    description: 'Sub-header label for the Video group inside the Content Blocks section',
  },
  subcategoryOther: {
    id: 'course-authoring.advanced-settings.subcategory.other',
    defaultMessage: 'Other',
    description: 'Sub-header label for uncategorized items inside the Content Blocks section',
  },
});

export default messages;
