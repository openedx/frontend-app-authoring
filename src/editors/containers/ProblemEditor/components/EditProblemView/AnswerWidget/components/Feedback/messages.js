import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({

  feedbackPlaceholder: {
    id: 'authoring.answerwidget.feedback.placeholder',
    defaultMessage: 'Feedback message',
    description: 'Placeholder text for feedback text',
  },
  feedbackToggleIconAltText: {
    id: 'authoring.answerwidget.feedback.icon.alt',
    defaultMessage: 'Toggle feedback',
    description: 'Alt text for feedback toggle icon',
  },
  selectedFeedbackLabel: {
    id: 'authoring.answerwidget.feedback.selected.label',
    defaultMessage: 'Show following feedback when {answerId} {boldunderline}:',
    description: 'Label text for feedback if option is selected',
  },
  selectedFeedbackLabelBoldUnderlineText: {
    id: 'authoring.answerwidget.feedback.selected.label.boldunderline',
    defaultMessage: 'is selected',
    description: 'Bold & underlined text for feedback if option is selected',
  },
  unSelectedFeedbackLabel: {
    id: 'authoring.answerwidget.feedback.unselected.label',
    defaultMessage: 'Show following feedback when {answerId} {boldunderline}:',
    description: 'Label text for feedback if option is not selected',
  },
  unSelectedFeedbackLabelBoldUnderlineText: {
    id: 'authoring.answerwidget.feedback.unselected.label.boldunderline',
    defaultMessage: 'is not selected',
    description: 'Bold & underlined text for feedback if option is not selected',
  },
});

export default messages;
