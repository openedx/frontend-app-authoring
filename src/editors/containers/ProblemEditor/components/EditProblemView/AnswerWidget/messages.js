import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  answerWidgetTitle: {
    id: 'authoring.answerwidget.answer.answerWidgetTitle',
    defaultMessage: 'Answers',
    description: 'Main title for Answers widget',
  },
  answerHelperText: {
    id: 'authoring.problemEditor.answerWidget.answer.answerHelperText',
    defaultMessage: '{helperText}',
    description: 'Helper text describing how the user should input answers',
  },
  addAnswerButtonText: {
    id: 'authoring.answerwidget.answer.addAnswerButton',
    defaultMessage: 'Add answer',
    description: 'Button text to add answer',
  },
  answerTextboxPlaceholder: {
    id: 'authoring.answerwidget.answer.placeholder',
    defaultMessage: 'Enter an answer',
    description: 'Placeholder text for answer option text',
  },
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
  answerDeleteIconAltText: {
    id: 'authoring.answerwidget.answer.delete.icon.alt',
    defaultMessage: 'Delete answer',
    description: 'Alt text for delete icon',
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

  addAnswerRangeButtonText: {
    id: 'authoring.answerwidget.answer.addAnswerRangeButton',
    defaultMessage: 'Add answer range',
    description: 'Button text to add a range of answers',
  },
  answerRangeTextboxPlaceholder: {
    id: 'authoring.answerwidget.answer.answerRangeTextboxPlaceholder',
    defaultMessage: 'Enter an answer range',
    description: 'Text to prompt the user to add an answer range to the textbox.',
  },
  answerRangeHelperText: {
    id: 'authoring.answerwidget.answer.answerRangeHelperText',
    defaultMessage: 'Enter min and max values separated by a comma. Use a bracket to include the number next to it in the range, or a parenthesis to exclude the number. For example, to identify the correct answers as 5, 6, or 7, but not 8, specify [5,8).',
    description: 'Helper text describing usage of answer ranges',
  },
});

export default messages;
