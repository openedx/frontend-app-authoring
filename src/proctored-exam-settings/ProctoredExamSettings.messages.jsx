import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'authoring.examsettings.allowoptout.no': {
    id: 'authoring.examsettings.allowoptout.no',
    defaultMessage: 'No',
    description: '"No" option for yes/no radio button set',
  },
  'authoring.examsettings.allowoptout.yes': {
    id: 'authoring.examsettings.allowoptout.yes',
    defaultMessage: 'Yes',
    description: '"Yes" option for yes/no radio button set',
  },
  'authoring.examsettings.createzendesk.no': {
    id: 'authoring.examsettings.createzendesk.no',
    defaultMessage: 'No',
    description: '"No" option for yes/no radio button set.',
  },
  'authoring.examsettings.createzendesk.yes': {
    id: 'authoring.examsettings.createzendesk.yes',
    defaultMessage: 'Yes',
    description: '"Yes" option for yes/no radio button set.',
  },
  'authoring.examsettings.support.text': {
    id: 'authoring.examsettings.support.text',
    defaultMessage: 'Support Page',
    description: 'Text linking to the support page.',
  },
  'authoring.examsettings.enableproctoredexams.label': {
    id: 'authoring.examsettings.escalationemail.enableproctoredexams.label',
    defaultMessage: 'Enable Proctored Exams',
    description: 'Label for checkbox to enable proctored exams.',
  },
  'authoring.examsettings.escalationemail.error.blank': {
    id: 'authoring.examsettings.escalationemail.error.blank',
    defaultMessage: 'The Proctortrack Escalation Email field cannot be empty if proctortrack is the selected provider.',
    description: 'Error message for missing required email field.',
  },
  'authoring.examsettings.escalationemail.error.invalid': {
    id: 'authoring.examsettings.escalationemail.error.invalid',
    defaultMessage: 'The Proctortrack Escalation Email field is in the wrong format and is not valid.',
    description: 'Error message for a invalid email format.',
  },
  'authoring.examsettings.error.single': {
    id: 'authoring.examsettings.error.single',
    defaultMessage: 'There is 1 error in this form.',
    description: 'Error alert for one and only one error in the form.',
  },
  'authoring.examsettings.error.multiple': {
    id: 'authoring.examsettings.escalationemail.error.multiple',
    defaultMessage: 'There are {numOfErrors} errors in this form.',
    description: 'Error alert for multiple errors in the form.',
  },
  'authoring.examsettings.provider.label': {
    id: 'authoring.examsettings.provider.label',
    defaultMessage: 'Proctoring Provider',
    description: 'Label for provider dropdown selection.',
  },
  'authoring.examsettings.provider.help': {
    id: 'authoring.examsettings.provider.help',
    defaultMessage: 'Select the proctoring provider you want to use for this course run.',
    description: 'Help text for selecting a proctoring provider.',
  },
  'authoring.examsettings.provider.help.aftercoursestart': {
    id: 'authoring.examsettings.provider.help.aftercoursestart',
    defaultMessage: 'Proctoring provider cannot be modified after course start date.',
    description: 'Help text notifying the user that the provider cannot be changed for a course that has already begun.',
  },
});

export default messages;
