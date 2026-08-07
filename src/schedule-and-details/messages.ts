import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  headingTitle: {
    id: 'course-authoring.schedule.heading.title',
    defaultMessage: 'Schedule & details',
  },
  headingSubtitle: {
    id: 'course-authoring.schedule.heading.subtitle',
    defaultMessage: 'Settings',
  },
  buttonSaveText: {
    id: 'course-authoring.schedule.alert.button.save',
    defaultMessage: 'Save changes',
  },
  buttonSavingText: {
    id: 'course-authoring.schedule.alert.button.saving',
    defaultMessage: 'Saving',
  },
  buttonCancelText: {
    id: 'course-authoring.schedule.alert.button.cancel',
    defaultMessage: 'Cancel',
  },
  alertWarningAriaLabelledby: {
    id: 'course-authoring.schedule.alert.warning.aria.labelledby',
    defaultMessage: 'notification-warning-title',
  },
  alertWarningAriaDescribedby: {
    id: 'course-authoring.schedule.alert.warning.aria.describedby',
    defaultMessage: 'notification-warning-description',
  },
  alertWarning: {
    id: 'course-authoring.schedule.alert.warning',
    defaultMessage: 'You\'ve made some changes',
  },
  alertWarningOnSaveWithError: {
    id: 'course-authoring.schedule.alert.warning.save.error',
    defaultMessage: 'You\'ve made some changes, but there are some errors',
  },
  alertWarningDescriptions: {
    id: 'course-authoring.schedule.alert.warning.descriptions',
    defaultMessage: 'Your changes will not take effect until you save your progress.',
  },
  alertWarningDescriptionsOnSaveWithError: {
    id: 'course-authoring.schedule.alert.warning.save.descriptions.error',
    defaultMessage: 'Please address the errors on this page first, and then save your progress.',
  },
  alertSuccessAriaLabelledby: {
    id: 'course-authoring.schedule.alert.success.aria.labelledby',
    defaultMessage: 'alert-confirmation-title',
  },
  alertSuccessAriaDescribedby: {
    id: 'course-authoring.schedule.alert.success.aria.describedby',
    defaultMessage: 'alert-confirmation-description',
  },
  alertSuccess: {
    id: 'course-authoring.schedule.alert.success',
    defaultMessage: 'Your changes have been saved.',
  },
  alertLoadFailAriaLabelledby: {
    id: 'course-authoring.schedule.alert.load.fail.aria.labelledby',
    defaultMessage: 'alert-confirmation-title',
  },
  alertLoadFailAriaDescribedby: {
    id: 'course-authoring.schedule.alert.load.fail.aria.describedby',
    defaultMessage: 'alert-confirmation-description',
  },
  alertLoadFail: {
    id: 'course-authoring.schedule.alert.load.fail',
    defaultMessage: 'We encountered an error when loading your settings.',
  },
  alertFailAriaLabelledby: {
    id: 'course-authoring.schedule.alert.fail.aria.labelledby',
    defaultMessage: 'alert-confirmation-title',
  },
  alertFailAriaDescribedby: {
    id: 'course-authoring.schedule.alert.fail.aria.describedby',
    defaultMessage: 'alert-confirmation-description',
  },
  alertFail: {
    id: 'course-authoring.schedule.alert.fail',
    defaultMessage: 'We encountered an error when saving your changes.',
  },
  errorMessage1: {
    id: 'course-authoring.schedule.schedule-section.error-message-1',
    defaultMessage: 'The certificates display behavior must be \'A date after the course end date\' if certificate available date is set.',
  },
  errorMessage2: {
    id: 'course-authoring.schedule.schedule-section.error-message-2',
    defaultMessage: 'The enrollment end date cannot be after the course end date.',
  },
  errorMessage3: {
    id: 'course-authoring.schedule.schedule-section.error-message-3',
    defaultMessage: 'The enrollment start date cannot be after the enrollment end date.',
  },
  errorMessage4: {
    id: 'course-authoring.schedule.schedule-section.error-message-4',
    defaultMessage: 'The course start date must be later than the enrollment start date.',
  },
  errorMessage5: {
    id: 'course-authoring.schedule.schedule-section.error-message-5',
    defaultMessage: 'The course end date must be later than the course start date.',
  },
  errorMessage6: {
    id: 'course-authoring.schedule.schedule-section.error-message-6',
    defaultMessage: 'The certificate available date must be later than the course end date.',
  },
  errorMessage7: {
    id: 'course-authoring.schedule.schedule-section.error-message-7',
    defaultMessage: 'The course must have an assigned start date.',
  },
  errorMessage8: {
    id: 'course-authoring.schedule.schedule-section.error-message-8',
    defaultMessage: 'Please enter an integer between %(min)s and %(max)s.',
  },
});

export default messages;
