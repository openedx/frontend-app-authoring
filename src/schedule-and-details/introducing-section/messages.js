import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  introducingTitle: {
    id: 'course-authoring.schedule-section.introducing.title',
    defaultMessage: 'Introducing your course',
  },
  introducingDescription: {
    id: 'course-authoring.schedule-section.introducing.description',
    defaultMessage: 'Information for prospective students',
  },
  courseShortDescriptionLabel: {
    id: 'course-authoring.schedule-section.introducing.course-short-description.label',
    defaultMessage: 'Course short description',
  },
  courseShortDescriptionAriaLabel: {
    id: 'course-authoring.schedule-section.introducing.course-short-description.aria-label',
    defaultMessage: 'Show course short description',
  },
  courseShortDescriptionHelpText: {
    id: 'course-authoring.schedule-section.introducing.course-short-description.help-text',
    defaultMessage: 'Appears on the course catalog page when students roll over the course name. Limit to ~150 characters',
  },
  courseOverviewLabel: {
    id: 'course-authoring.schedule-section.introducing.course-overview.label',
    defaultMessage: 'Course overview',
  },
  courseOverviewHelpText: {
    id: 'course-authoring.schedule-section.introducing.course-overview.help-text',
    defaultMessage: 'Introductions, prerequisites, FAQs that are used on {hyperlink} (formatted in HTML)',
  },
  courseAboutHyperlink: {
    id: 'course-authoring.schedule-section.introducing.course-about.hyperlink',
    defaultMessage: 'your course summary page',
  },
  courseAboutSidebarLabel: {
    id: 'course-authoring.schedule-section.introducing.course-about-sidebar.label',
    defaultMessage: 'Course about sidebar HTML',
  },
  courseAboutSidebarHelpText: {
    id: 'course-authoring.schedule-section.introducing.course-about-sidebar.help-text',
    defaultMessage: 'Custom sidebar content for {hyperlink} (formatted in HTML)',
  },
});

export default messages;
