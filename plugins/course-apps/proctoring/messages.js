import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'authoring.proctoring.alert.error': {
    id: 'authoring.proctoring.alert.error',
    defaultMessage: 'We encountered a technical error while trying to save proctored exam settings. This might be a temporary issue, so please try again in a few minutes. If the problem persists, please go to the {support_link} for help.',
    description: 'Alert message for proctoring settings save error.',
  },
  'authoring.proctoring.alert.forbidden': {
    id: 'authoring.proctoring.alert.forbidden',
    defaultMessage: 'You do not have permission to edit proctored exam settings for this course. If you are a course team member and this problem persists, please go to the {support_link} for help.',
    description: 'Alert message for proctoring settings permission error.',
  },
  'authoring.proctoring.no': {
    id: 'authoring.proctoring.no',
    defaultMessage: 'No',
    description: '"No" option for yes/no radio button set',
  },
  'authoring.proctoring.yes': {
    id: 'authoring.proctoring.yes',
    defaultMessage: 'Yes',
    description: '"Yes" option for proctored exam settings',
  },
  'authoring.proctoring.support.text': {
    id: 'authoring.proctoring.support.text',
    defaultMessage: 'Support Page',
    description: 'Text linking to the support page.',
  },
  'authoring.proctoring.enableproctoredexams.label': {
    id: 'authoring.proctoring.enableproctoredexams.label',
    defaultMessage: 'Proctored exams',
    description: 'Label for checkbox to enable proctored exams.',
  },
  'authoring.proctoring.enableproctoredexams.help': {
    id: 'authoring.proctoring.enableproctoredexams.help',
    defaultMessage: 'Enable and configure proctored exams in your course.',
    description: 'Help text for checkbox to enable proctored exams.',
  },
  'authoring.proctoring.enabled': {
    id: 'authoring.proctoring.enabled',
    defaultMessage: 'Enabled',
    description: 'Text describing that the feature is enabled.',
  },
  'authoring.proctoring.learn.more': {
    id: 'authoring.proctoring.learn.more',
    defaultMessage: 'Learn more about proctoring',
    description: 'Link to learn more about the proctoring feature.',
  },
  'authoring.proctoring.provider.label': {
    id: 'authoring.proctoring.provider.label',
    defaultMessage: 'Proctoring provider',
    description: 'Label for proctoring provider dropdown selection.',
  },
  'authoring.proctoring.provider.help': {
    id: 'authoring.proctoring.provider.help',
    defaultMessage: 'Select the proctoring provider you want to use for this course run.',
    description: 'Help text for selecting a proctoring provider.',
  },
  'authoring.proctoring.provider.help.aftercoursestart': {
    id: 'authoring.proctoring.provider.help.aftercoursestart',
    defaultMessage: 'Proctoring provider cannot be modified after course start date.',
    description: 'Help text notifying the user that the provider cannot be changed for a course that has already begun.',
  },
  'authoring.proctoring.escalationemail.label': {
    id: 'authoring.proctoring.escalationemail.label',
    defaultMessage: 'Escalation email',
    description: 'Label for escalation email text field',
  },
  'authoring.proctoring.escalationemail.help': {
    id: 'authoring.proctoring.escalationemail.help',
    defaultMessage: 'Provide an email address to be contacted by the support team for escalations (e.g. appeals, delayed reviews).',
    description: 'Help text explaining escalation email field.',
  },
  'authoring.proctoring.escalationemail.error.blank': {
    id: 'authoring.proctoring.escalationemail.error.blank',
    defaultMessage: 'The Escalation Email field cannot be empty if {proctoringProviderName} is the selected provider.',
    description: 'Error message for missing required email field.',
  },
  'authoring.proctoring.escalationemail.error.invalid': {
    id: 'authoring.proctoring.escalationemail.error.invalid',
    defaultMessage: 'The Escalation Email field is in the wrong format and is not valid.',
    description: 'Error message for a invalid email format.',
  },
  'authoring.proctoring.allowoptout.label': {
    id: 'authoring.proctoring.allowoptout.label',
    defaultMessage: 'Allow learners to opt out of proctoring on proctored exams',
    description: 'Label for radio selection allowing proctored exam opt out',
  },
  'authoring.proctoring.createzendesk.label': {
    id: 'authoring.proctoring.createzendesk.label',
    defaultMessage: 'Create Zendesk tickets for suspicious attempts',
    description: 'Label for Zendesk ticket creation radio select.',
  },
  'authoring.proctoring.error.single': {
    id: 'authoring.proctoring.error.single',
    defaultMessage: 'There is 1 error in this form.',
    description: 'Error alert for one and only one error in the form.',
  },
  'authoring.proctoring.error.multiple': {
    id: 'authoring.proctoring.escalationemail.error.multiple',
    defaultMessage: 'There are {numOfErrors} errors in this form.',
    description: 'Error alert for multiple errors in the form.',
  },
  'authoring.proctoring.save': {
    id: 'authoring.proctoring.save',
    defaultMessage: 'Save',
    description: 'Button to save proctoring settings.',
  },
  'authoring.proctoring.saving': {
    id: 'authoring.proctoring.saving',
    defaultMessage: 'Saving...',
    description: 'Proctoring settings are in the process of saving.',
  },
  'authoring.proctoring.cancel': {
    id: 'authoring.proctoring.cancel',
    defaultMessage: 'Cancel',
    description: 'Button to cancel edits to proctoring settings.',
  },
  'authoring.proctoring.studio.link.text': {
    id: 'authoring.proctoring.studio.link.text',
    defaultMessage: 'Go back to your course in Studio',
    description: 'Link to go back to the course Studio page.',
  },
});

export default messages;
