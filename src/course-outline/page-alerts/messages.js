import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  configurationErrorTitle: {
    id: 'course-authoring.course-outline.page-alerts.configurationErrorTitle',
    defaultMessage: 'This course was created as a re-run. Some manual configuration is needed.',
    description: 'Configuration error alert title in course outline.',
  },
  configurationErrorText: {
    id: 'course-authoring.course-outline.page-alerts.configurationErrorText',
    defaultMessage: 'No course content is currently visible, and no learners are enrolled. Be sure to review and reset all dates, including the Course Start Date; set up the course team; review course updates and other assets for dated material; and seed the discussions and wiki.',
    description: 'Configuration error alert body in course outline.',
  },
  discussionNotificationText: {
    id: 'course-authoring.course-outline.page-alerts.discussionNotificationText',
    defaultMessage: 'This course run is using an upgraded version of {platformName} discussion forum. In order to display the discussions sidebar, discussions xBlocks will no longer be visible to learners.',
    description: 'Alert text for informing users about upgraded version of discussions forum.',
  },
  discussionNotificationLearnMore: {
    id: 'course-authoring.course-outline.page-alerts.discussionNotificationLearnMore',
    defaultMessage: 'Learn more',
    description: 'Learn more link in upgraded discussion notification alert',
  },
  discussionNotificationFeedback: {
    id: 'course-authoring.course-outline.page-alerts.discussionNotificationFeedback',
    defaultMessage: 'Share feedback',
    description: 'Share feedback link in upgraded discussion notification alert',
  },
  deprecationWarningTitle: {
    id: 'course-authoring.course-outline.page-alerts.deprecationWarningTitle',
    defaultMessage: 'This course uses features that are no longer supported.',
    description: 'Alert title informing users about deprecated features being used in course that are not supported.',
  },
  deprecationWarningBlocksText: {
    id: 'course-authoring.course-outline.page-alerts.deprecationWarningBlocksText',
    defaultMessage: 'You must delete or replace the following components.',
    description: 'Alert body text informing users about deprecated components which needs to be removed or replaced.',
  },
  deprecationWarningDeprecatedBlockText: {
    id: 'course-authoring.course-outline.page-alerts.deprecationWarningDeprecatedBlockText',
    defaultMessage: 'To avoid errors, {platformName} strongly recommends that you remove unsupported features from the course advanced settings. To do this, go to the {hyperlink}, locate the "Advanced Module List" setting, and then delete the following modules from the list.',
    description: 'Alert body text informing users about how to remove deprecated components/modules.',
  },
  advancedSettingLinkText: {
    id: 'course-authoring.course-outline.page-alerts.advancedSettingLinkText',
    defaultMessage: 'Advanced Settings page',
    description: 'Advanced settings page link text',
  },
  deprecatedComponentName: {
    id: 'course-authoring.course-outline.page-alerts.deprecatedComponentName',
    defaultMessage: 'Deprecated Component',
    description: 'Default name for a deprecated component.',
  },
  proctoringErrorTitle: {
    id: 'course-authoring.course-outline.page-alerts.proctoringErrorTitle',
    defaultMessage: 'This course has proctored exam settings that are incomplete or invalid.',
    description: 'Proctoring settings errors alert title.',
  },
  proctoringErrorText: {
    id: 'course-authoring.course-outline.page-alerts.proctoringErrorText',
    defaultMessage: 'To update these settings go to the {hyperlink}.',
    description: 'Proctoring settings errors alert body text.',
  },
  proctoredSettingsLinkText: {
    id: 'course-authoring.course-outline.page-alerts.proctoredSettingsLinkText',
    defaultMessage: 'Proctored Exam Settings page',
    description: 'Proctoring settings page link text.',
  },
  alertFailedGeneric: {
    id: 'course-authoring.course-outline.page-alert.generic-error.description',
    defaultMessage: 'Unable to {actionName} {type}. Please try again.',
    description: 'Generic alert text.',
  },
  newFileAlertTitle: {
    id: 'course-authoring.course-outline.page-alert.paste-alert.new-files.title',
    defaultMessage: 'New {newFilesLen, plural, one {file} other {files}} added to Files.',
    description: 'This title is displayed when new files are successfully imported into the course after pasting an unit.',
  },
  newFileAlertDesc: {
    id: 'course-authoring.course-outline.page-alert.paste-alert.new-files.description',
    defaultMessage: 'The following required {newFilesLen, plural, one {file was} other {files were}} imported to this course: {newFilesStr}',
    description: 'This description is displayed when new files are successfully imported into the course after pasting an unit',
  },
  newFileAlertAction: {
    id: 'course-authoring.course-outline.page-alert.paste-alert.new-files.action',
    defaultMessage: 'View files',
    description: 'This label is used as the text for a button that allows the user to view the imported files.',
  },
  errorFileAlertTitle: {
    id: 'course-authoring.course-outline.page-alert.paste-alert.error-files.title',
    defaultMessage: 'Some errors occurred',
    description: 'This title is displayed when there are errors during the import of files while pasting an unit.',
  },
  errorFileAlertDesc: {
    id: 'course-authoring.course-outline.page-alert.paste-alert.error-files.description',
    defaultMessage: 'The following required {errorFilesLen, plural, one {file} other {files}} could not be added to the course: {errorFilesStr}',
    description: 'This description is displayed when there are errors during the import of files and lists the files that could not be imported.',
  },
  conflictingFileAlertTitle: {
    id: 'course-authoring.course-outline.page-alert.paste-alert.conflicting-files.title',
    defaultMessage: 'You may need to update {conflictingFilesLen, plural, one {a file} other {files}} manually',
    description: 'This alert title is displayed when files being imported conflict with existing files in the course.',
  },
  conflictingFileAlertDesc: {
    id: 'course-authoring.course-outline.page-alert.paste-alert.new-conflicting.description',
    defaultMessage: 'The following {conflictingFilesLen, plural, one {file} other {files}} already exist in this course but don\'t match the version used by the component you pasted:  {conflictingFilesStr}',
    description: 'This alert description is displayed when files being imported conflict with existing files in the course and advises the user to update the conflicting files manually.',
  },
  serverErrorAlert: {
    id: 'course-authoring.course-outline.page-alert.server-error.title',
    defaultMessage: 'The Studio servers encountered an error',
    description: 'Generic server error alert title.',
  },
  serverErrorAlertBody: {
    id: 'course-authoring.course-outline.page-alert.server-error.body',
    defaultMessage: ' An error occurred in Studio and the page could not be loaded. Please try again in a few moments. We\'ve logged the error and our staff is currently working to resolve this error as soon as possible.',
    description: 'Generic server error alert title.',
  },
  networkErrorAlert: {
    id: 'course-authoring.course-outline.page-alert.network-error.title',
    defaultMessage: 'Network error',
    description: 'Generic network error alert.',
  },
  forbiddenAlert: {
    id: 'course-authoring.course-outline.page-alert.forbidden.title',
    defaultMessage: 'Access Restricted',
    description: 'Forbidden(403) alert title',
  },
  forbiddenAlertBody: {
    id: 'course-authoring.course-outline.page-alert.forbidden.body',
    defaultMessage: 'It looks like you’re trying to access a page you don’t have permission to view. Contact your admin if you think this is a mistake, or head back to the {LMS}.',
    description: 'Forbidden(403) alert body',
  },
  forbiddenAlertLmsUrl: {
    id: 'course-authoring.course-outline.page-alert.lms',
    defaultMessage: 'LMS',
    description: 'LMS base redirection url',
  },
});

export default messages;
