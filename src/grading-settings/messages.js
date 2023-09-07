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
    defaultMessage: "You've made some changes",
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
  buttonSavingText: {
    id: 'course-authoring.grading-settings.alert.button.saving',
    defaultMessage: 'Saving',
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
  creditEligibilitySectionTitle: {
    id: 'course-authoring.grading-settings.credit-eligibility.title',
    defaultMessage: 'Credit eligibility',
  },
  creditEligibilitySectionDescription: {
    id: 'course-authoring.grading-settings.credit-eligibility.description',
    defaultMessage: 'Settings for course credit eligibility',
  },
  gradingRulesPoliciesSectionTitle: {
    id: 'course-authoring.grading-settings.grading-rules-policies.title',
    defaultMessage: 'Grading rules & policies',
  },
  gradingRulesPoliciesSectionDescription: {
    id: 'course-authoring.grading-settings.grading-rules-policies.description',
    defaultMessage: 'Deadlines, requirements, and logistics around grading student work',
  },
  assignmentTypeSectionTitle: {
    id: 'course-authoring.grading-settings.assignment-type.title',
    defaultMessage: 'Assignment types',
  },
  assignmentTypeSectionDescription: {
    id: 'course-authoring.grading-settings.assignment-type.description',
    defaultMessage: 'Categories and labels for any exercises that are gradable',
  },
  addNewAssignmentTypeBtn: {
    id: 'course-authoring.grading-settings.add-new-assignment-type.btn',
    defaultMessage: 'New assignment type',
  },
});

export default messages;
