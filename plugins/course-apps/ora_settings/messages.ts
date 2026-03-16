import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  heading: {
    id: 'course-authoring.pages-resources.ora.heading',
    defaultMessage: 'Configure Flexible Peer Grading',
    description: 'Title for the modal dialog header',
  },
  ORASettingsHelpLink: {
    id: 'course-authoring.pages-resources.ora.flex-peer-grading.link',
    defaultMessage: 'Learn more about open response assessment settings',
    description: 'Descriptive text for the hyperlink to the docs site',
  },
  enableFlexPeerGradeLabel: {
    id: 'course-authoring.pages-resources.ora.flex-peer-grading.label',
    defaultMessage: 'Flex Peer Grading',
    description: 'Label for form switch',
  },
  enableFlexPeerGradeHelp: {
    id: 'course-authoring.pages-resources.ora.flex-peer-grading.help',
    defaultMessage: 'Turn on Flexible Peer Grading for all open response assessments in the course with peer grading.',
    description: 'Help text describing what happens when the switch is enabled',
  },
  enabledBadgeLabel: {
    id: 'course-authoring.pages-resources.ora.flex-peer-grading.enabled-badge.label',
    defaultMessage: 'Enabled',
    description: 'Label for badge that show users that a setting is enabled',
  },
  cancelLabel: {
    id: 'course-authoring.pages-resources.ora.flex-peer-grading.cancel-button.label',
    defaultMessage: 'Cancel',
    description: 'Label for button that cancels user changes',
  },
  saveLabel: {
    id: 'course-authoring.pages-resources.ora.flex-peer-grading.save-button.label',
    defaultMessage: 'Save',
    description: 'Label for button that saves user changes',
  },
  pendingSaveLabel: {
    id: 'course-authoring.pages-resources.ora.flex-peer-grading.pending-save-button.label',
    defaultMessage: 'Saving',
    description: 'Label for button that has pending api save calls',
  },
  errorSavingTitle: {
    id: 'course-authoring.pages-resources.ora.flex-peer-grading.save-error.title',
    defaultMessage: 'We couldn\'t apply your changes.',
  },
  errorSavingMessage: {
    id: 'course-authoring.pages-resources.ora.flex-peer-grading.save-error.message',
    defaultMessage: 'Please check your entries and try again.',
  },
});

export default messages;
