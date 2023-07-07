import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  headingTitle: {
    id: 'course-authoring.grading-settings.heading.title',
    defaultMessage: 'Grading',
  },
  headingSubtitle: {
    id: 'course-authoring.grading-settings.heading.subtitle',
    defaultMessage: 'Settings',
  },
  policy: {
    id: 'course-authoring.grading-settings.policies.title',
    defaultMessage: 'Overall grade range',
  },
  policiesDescription: {
    id: 'course-authoring.grading-settings.policies.description',
    defaultMessage: 'Your overall grading scale for student final grades',
  },
  alertWarning: {
    id: 'course-authoring.grading-settings.alert.warning',
    defaultMessage: 'You`ve made some changes',
  },
  alertWarningDescriptions: {
    id: 'course-authoring.grading-settings.alert.warning.descriptions',
    defaultMessage: 'Your changes will not take effect until you save your progress. Take care with key and value formatting, as validation is not implemented.',
  },
  alertSuccess: {
    id: 'course-authoring.grading-settings.alert.success',
    defaultMessage: 'Your changes have been saved.',
  },
  buttonSaveText: {
    id: 'course-authoring.grading-settings.alert.button.save',
    defaultMessage: 'Save changes',
  },
  buttonCancelText: {
    id: 'course-authoring.grading-settings.alert.button.cancel',
    defaultMessage: 'Cancel',
  },
  alertWarningAriaLabelledby: {
    id: 'course-authoring.grading-settings.alert.warning.aria.labelledby',
    defaultMessage: 'notification-warning-title',
  },
  alertWarningAriaDescribedby: {
    id: 'course-authoring.grading-settings.alert.warning.aria.describedby',
    defaultMessage: 'notification-warning-description',
  },
  alertSuccessAriaLabelledby: {
    id: 'course-authoring.grading-settings.alert.success.aria.labelledby',
    defaultMessage: 'alert-confirmation-title',
  },
  alertSuccessAriaDescribedby: {
    id: 'course-authoring.grading-settings.alert.success.aria.describedby',
    defaultMessage: 'alert-confirmation-description',
  },
});

export default messages;
