import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({

  noGroupFeedbackSummary: {
    id: 'authoring.problemeditor.settings.GroupFeedbackSummary.nonMessage',
    defaultMessage: 'None',
    description: 'message to confirm that a user wants to use the advanced editor',
  },
  groupFeedbackSummary: {
    id: 'authoring.problemeditor.settings.GroupFeedbackSummary.message',
    defaultMessage: '{groupFeedback}',
    description: 'summary of current feedbacks provided for multiple problems',
  },
  addGroupFeedbackButtonText: {
    id: 'authoring.problemeditor.settings.addGroupFeedbackButtonText',
    defaultMessage: 'Add group feedback',
    description: 'addGroupFeedbackButtonText',
  },
  groupFeedbackInputLabel: {
    id: 'authoring.problemeditor.settings.GroupFeedbackInputLabel',
    defaultMessage: 'Group feedback will appear when a student selects a specific set of answers.',
    description: 'label for group feedback input',
  },
  groupFeedbackSettingTitle: {
    id: 'authoring.problemeditor.settings.GroupFeedbackSettingTitle',
    defaultMessage: 'Group Feedback',
    description: 'label for group feedback setting',
  },
});

export default messages;
