import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  noAnswerCancelButtonLabel: {
    id: 'authoring.problemEditor.editProblemView.noAnswerModal.cancelButton.label',
    defaultMessage: 'Cancel',
    description: 'Label for cancel button in the no answer modal',
  },
  noAnswerSaveButtonLabel: {
    id: 'authoring.problemEditor.editProblemView.noAnswerModal.saveButton.label',
    defaultMessage: 'Ok',
    description: 'Label for save button in the no answer modal',
  },
  noAnswerModalTitle: {
    id: 'authoring.problemEditor.editProblemView.noAnswerModal.title',
    defaultMessage: 'No answer specified',
    description: 'Title for no answer modal',
  },
  noAnswerModalBodyQuestion: {
    id: 'authoring.problemEditor.editProblemView.noAnswerModal.body.question',
    defaultMessage: 'Are you sure you want to exit the editor?',
    description: 'Question in body of no answer modal',
  },
  noAnswerModalBodyExplanation: {
    id: 'authoring.problemEditor.editProblemView.noAnswerModal.body.explanation',
    defaultMessage: 'No correct answer has been specified.',
    description: 'Explanation in body of no answer modal',
  },
});

export default messages;
