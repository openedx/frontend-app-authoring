import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'authoring.examsettings.allowoptout.help': {
    id: 'authoring.examsettings.allowoptout.help',
    defaultMessage: 'If this value is "Yes", learners can choose to take proctored exams without proctoring. If this value is "No", all learners must take the exam with proctoring. This setting only applies if proctored exams are enabled for the course.',
    description: '',
  },
  'authoring.examsettings.allowoptout.no': {
    id: 'authoring.examsettings.allowoptout.no',
    defaultMessage: 'No',
    description: '',
  },
  'authoring.examsettings.allowoptout.yes': {
    id: 'authoring.examsettings.allowoptout.yes',
    defaultMessage: 'Yes',
    description: '',
  },
  'authoring.examsettings.createzendesk.no': {
    id: 'authoring.examsettings.createzendesk.no',
    defaultMessage: 'No',
    description: '',
  },
  'authoring.examsettings.createzendesk.yes': {
    id: 'authoring.examsettings.createzendesk.yes',
    defaultMessage: 'Yes',
    description: '',
  },
  'authoring.examsettings.enableproctoredexams.label': {
    id: 'authoring.examsettings.escalationemail.enableproctoredexams.label',
    defaultMessage: 'Enable Proctored Exams',
    description: '',
  },
  'authoring.examsettings.escalationemail.error.blank': {
    id: 'authoring.examsettings.escalationemail.error.blank',
    defaultMessage: 'The Proctortrack Escalation Email field cannot be empty if proctortrack is the selected provider.',
    description: '',
  },
  'authoring.examsettings.escalationemail.error.invalid': {
    id: 'authoring.examsettings.escalationemail.error.invalid',
    defaultMessage: 'The Proctortrack Escalation Email field is in the wrong format and is not valid.',
    description: '',
  },
  'authoring.examsettings.escalationemail.error.single': {
    id: 'authoring.examsettings.escalationemail.error.single',
    defaultMessage: 'There is 1 error in this form.',
    description: '',
  },
  'authoring.examsettings.escalationemail.error.multiple': {
    id: 'authoring.examsettings.escalationemail.error.multiple',
    defaultMessage: 'There are {numOfErrors} errors in this form.',
    description: '',
  },
  'authoring.examsettings.escalationemail.help': {
    id: 'authoring.examsettings.escalationemail.help',
    defaultMessage: 'Required if "proctortrack" is selected as your proctoring provider.Enter an email address to be contacted by the support team whenever there are escalations (e.g. appeals, delayed reviews, etc.).',
    description: '',
  },
  'authoring.examsettings.provider.label': {
    id: 'authoring.examsettings.provider.label',
    defaultMessage: 'Proctoring Provider',
    description: '',
  },
  'authoring.examsettings.provider.help': {
    id: 'authoring.examsettings.provider.help',
    defaultMessage: 'Select the proctoring provider you want to use for this course run.',
    description: '',
  },
  'authoring.examsettings.provider.help.aftercoursestart': {
    id: 'authoring.examsettings.provider.help.aftercoursestart',
    defaultMessage: 'Proctoring provider cannot be modified after course start date.',
    description: '',
  },
});

export default messages;
