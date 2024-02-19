import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  configurationErrorTitle: {
    id: 'course-authoring.course-outline.page-alerts.configurationErrorTitle',
    defaultMessage: 'This course was created as a re-run. Some manual configuration is needed.',
  },
  configurationErrorText: {
    id: 'course-authoring.course-outline.page-alerts.configurationErrorText',
    defaultMessage: 'No course content is currently visible, and no learners are enrolled. Be sure to review and reset all dates, including the Course Start Date; set up the course team; review course updates and other assets for dated material; and seed the discussions and wiki.',
  },
  discussionNotificationText: {
    id: 'course-authoring.course-outline.page-alerts.discussionNotificationText',
    defaultMessage: 'This course run is using an upgraded version of {platformName} discussion forum. In order to display the discussions sidebar, discussions xBlocks will no longer be visible to learners.',
  },
  discussionNotificationLearnMore: {
    id: 'course-authoring.course-outline.page-alerts.discussionNotificationLearnMore',
    defaultMessage: 'Learn more',
  },
  discussionNotificationFeedback: {
    id: 'course-authoring.course-outline.page-alerts.discussionNotificationLearnMore',
    defaultMessage: 'Share feedback',
  },
  deprecationWarningTitle: {
    id: 'course-authoring.course-outline.page-alerts.deprecationWarningTitle',
    defaultMessage: 'This course uses features that are no longer supported.',
  },
  deprecationWarningBlocksText: {
    id: 'course-authoring.course-outline.page-alerts.deprecationWarningBlocksText',
    defaultMessage: 'You must delete or replace the following components.',
  },
  deprecationWarningDeprecatedBlockText: {
    id: 'course-authoring.course-outline.page-alerts.deprecationWarningDeprecatedBlockText',
    defaultMessage: 'To avoid errors, {platformName} strongly recommends that you remove unsupported features from the course advanced settings. To do this, go to the {hyperlink}, locate the "Advanced Module List" setting, and then delete the following modules from the list.',
  },
  advancedSettingLinkText: {
    id: 'course-authoring.course-outline.page-alerts.advancedSettingLinkText',
    defaultMessage: 'Advanced Settings page',
  },
  deprecatedComponentName: {
    id: 'course-authoring.course-outline.page-alerts.deprecatedComponentName',
    defaultMessage: 'Deprecated Component',
  },
  proctoringErrorTitle: {
    id: 'course-authoring.course-outline.page-alerts.proctoringErrorTitle',
    defaultMessage: 'This course has proctored exam settings that are incomplete or invalid.',
  },
  proctoringErrorText: {
    id: 'course-authoring.course-outline.page-alerts.proctoringErrorText',
    defaultMessage: 'To update these settings go to the {hyperlink}.',
  },
  proctoredSettingsLinkText: {
    id: 'course-authoring.course-outline.page-alerts.proctoredSettingsLinkText',
    defaultMessage: 'Proctored Exam Settings page',
  },
  alertFailedGeneric: {
    id: 'course-authoring.course-outline.page-alert.generic-error.description',
    defaultMessage: 'Unable to {actionName} {type}. Please try again.',
  },
  newFileAlertTitle: {
    id: 'course-authoring.course-outline.page-alert.paste-alert.new-files.title',
    defaultMessage: 'New {newFilesLen, plural, one {file} other {files}} added to Files & Uploads.',
  },
  newFileAlertDesc: {
    id: 'course-authoring.course-outline.page-alert.paste-alert.new-files.description',
    defaultMessage: 'The following required {newFilesLen, plural, one {file was} other {files were}} imported to this course: {newFilesStr}',
  },
  newFileAlertAction: {
    id: 'course-authoring.course-outline.page-alert.paste-alert.new-files.action',
    defaultMessage: 'View files',
  },
  errorFileAlertTitle: {
    id: 'course-authoring.course-outline.page-alert.paste-alert.error-files.title',
    defaultMessage: 'Some errors occurred',
  },
  errorFileAlertDesc: {
    id: 'course-authoring.course-outline.page-alert.paste-alert.error-files.description',
    defaultMessage: 'The following required {errorFilesLen, plural, one {file} other {files}} could not be added to the course: {errorFilesStr}',
  },
  conflictingFileAlertTitle: {
    id: 'course-authoring.course-outline.page-alert.paste-alert.conflicting-files.title',
    defaultMessage: 'You may need to update {conflictingFilesLen, plural, one {a file} other {files}} manually',
  },
  conflictingFileAlertDesc: {
    id: 'course-authoring.course-outline.page-alert.paste-alert.new-conflicting.description',
    defaultMessage: 'The following {conflictingFilesLen, plural, one {file} other {files}} already exist in this course but don\'t match the version used by the component you pasted:  {conflictingFilesStr}',
  },
});

export default messages;
