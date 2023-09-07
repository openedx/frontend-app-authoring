import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  about: {
    id: 'course-authoring.advanced-settings.sidebar.about.title',
    defaultMessage: 'What do advanced settings do?',
  },
  aboutDescription1: {
    id: 'course-authoring.advanced-settings.sidebar.about.description-1',
    defaultMessage: 'Advanced settings control specific course functionality. On this page, you can edit manual policies, which are JSON-based key and value pairs that control specific course settings.',
  },
  aboutDescription2: {
    id: 'course-authoring.advanced-settings.sidebar.about.description-2',
    defaultMessage: 'Any policies you modify here override all other information you’ve defined elsewhere in Studio. Do not edit policies unless you are familiar with both their purpose and syntax.',
  },
  other: {
    id: 'course-authoring.advanced-settings.sidebar.other.title',
    defaultMessage: 'Other course settings',
  },
  otherCourseSettingsLinkToScheduleAndDetails: {
    id: 'course-authoring.advanced-settings.sidebar.links.schedule-and-details',
    defaultMessage: 'Details & schedule',
    description: 'Link to Studio Details & schedule page',
  },
  otherCourseSettingsLinkToGrading: {
    id: 'course-authoring.advanced-settings.sidebar.links.grading',
    defaultMessage: 'Grading',
    description: 'Link to Studio Grading page',
  },
  otherCourseSettingsLinkToCourseTeam: {
    id: 'course-authoring.advanced-settings.sidebar.links.course-team',
    defaultMessage: 'Course team',
    description: 'Link to Studio Course team page',
  },
  otherCourseSettingsLinkToGroupConfigurations: {
    id: 'course-authoring.advanced-settings.sidebar.links.group-configurations',
    defaultMessage: 'Group configurations',
    description: 'Link to Studio Group configurations page',
  },
  otherCourseSettingsLinkToProctoredExamSettings: {
    id: 'course-authoring.advanced-settings.sidebar.links.proctored-exam-settings',
    defaultMessage: 'Proctored exam settings',
    description: 'Link to Proctored exam settings page',
  },
});

export default messages;
