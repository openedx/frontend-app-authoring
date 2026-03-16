import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  headingTitle: {
    id: 'course-authoring.advanced-settings.heading.title',
    defaultMessage: 'Advanced settings',
  },
  headingSubtitle: {
    id: 'course-authoring.advanced-settings.heading.subtitle',
    defaultMessage: 'Settings',
  },
  policy: {
    id: 'course-authoring.advanced-settings.policies.title',
    defaultMessage: 'Manual policy definition',
  },
  alertWarning: {
    id: 'course-authoring.advanced-settings.alert.warning',
    defaultMessage: "You've made some changes",
  },
  alertWarningDescriptions: {
    id: 'course-authoring.advanced-settings.alert.warning.descriptions',
    defaultMessage: 'Your changes will not take effect until you save your progress. Take care with key and value formatting, as validation is not implemented.',
  },
  alertSuccess: {
    id: 'course-authoring.advanced-settings.alert.success',
    defaultMessage: 'Your policy changes have been saved.',
  },
  alertSuccessDescriptions: {
    id: 'course-authoring.advanced-settings.alert.success.descriptions',
    defaultMessage: 'No validation is performed on policy keys or value pairs. If you are having difficulties, check your formatting.',
  },
  alertProctoringError: {
    id: 'course-authoring.advanced-settings.alert.proctoring.error',
    defaultMessage: 'This course has protected exam setting that are incomplete or invalid.',
  },
  alertProctoringErrorDescriptions: {
    id: 'course-authoring.advanced-settings.alert.proctoring.error.descriptions',
    defaultMessage: 'You will be unable to make changes until the following setting are updated on the page below.',
  },
  buttonSaveText: {
    id: 'course-authoring.advanced-settings.alert.button.save',
    defaultMessage: 'Save changes',
  },
  buttonSavingText: {
    id: 'course-authoring.advanced-settings.alert.button.saving',
    defaultMessage: 'Saving',
  },
  buttonCancelText: {
    id: 'course-authoring.advanced-settings.alert.button.cancel',
    defaultMessage: 'Cancel',
  },
  deprecatedButtonShowText: {
    id: 'course-authoring.advanced-settings.deprecated.button.show',
    defaultMessage: 'Show',
  },
  deprecatedButtonHideText: {
    id: 'course-authoring.advanced-settings.deprecated.button.hide',
    defaultMessage: 'Hide',
  },
  alertWarningAriaLabelledby: {
    id: 'course-authoring.advanced-settings.alert.warning.aria.labelledby',
    defaultMessage: 'notification-warning-title',
  },
  alertWarningAriaDescribedby: {
    id: 'course-authoring.advanced-settings.alert.warning.aria.describedby',
    defaultMessage: 'notification-warning-description',
  },
  alertSuccessAriaLabelledby: {
    id: 'course-authoring.advanced-settings.alert.success.aria.labelledby',
    defaultMessage: 'alert-confirmation-title',
  },
  alertSuccessAriaDescribedby: {
    id: 'course-authoring.advanced-settings.alert.success.aria.describedby',
    defaultMessage: 'alert-confirmation-description',
  },
  alertProctoringAriaLabelledby: {
    id: 'course-authoring.advanced-settings.alert.proctoring.error.aria.labelledby',
    defaultMessage: 'alert-danger-title',
  },
  alertProctoringDescribedby: {
    id: 'course-authoring.advanced-settings.alert.proctoring.error.aria.describedby',
    defaultMessage: 'alert-danger-description',
  },
});

export default messages;
