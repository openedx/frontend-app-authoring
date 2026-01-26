import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  saveWarningModalCancelButtonLabel: {
    id: 'authoring.problemEditor.editProblemView.saveWarningModal.cancelButton.label',
    defaultMessage: 'Cancel',
    description: 'Label for cancel button in the save warning modal',
  },
  saveWarningModalSaveButtonLabel: {
    id: 'authoring.problemEditor.editProblemView.saveWarningModal.saveButton.label',
    defaultMessage: 'Ok',
    description: 'Label for save button in the save warning modal',
  },
  saveWarningModalBodyQuestion: {
    id: 'authoring.problemEditor.editProblemView.saveWarningModal.body.question',
    defaultMessage: 'Are you sure you want to exit the editor?',
    description: 'Question in body of save warning modal',
  },
  noAnswerTitle: {
    id: 'authoring.problemEditor.editProblemView.saveWarningModal.noAnswer.title',
    defaultMessage: 'No answer specified',
    description: 'Title for no answer modal',
  },
  noAnswerBodyExplanation: {
    id: 'authoring.problemEditor.editProblemView.saveWarningModal.noAnswer.body.explanation',
    defaultMessage: 'No correct answer has been specified.',
    description: 'Explanation in body of no answer modal',
  },
  olxSettingDiscrepancyTitle: {
    id: 'authoring.problemEditor.editProblemView.saveWarningModal.olxSettingDiscrepancy.title',
    defaultMessage: 'OLX settings discrepancy',
    description: 'Title for mismatched settings modal',
  },
  olxSettingDiscrepancyBodyExplanation: {
    id: 'authoring.problemEditor.editProblemView.saveWarningModal.olxSettingDiscrepancy.body.explanation',
    defaultMessage: `A discrepancy was found between the settings defined in the OLX's problem tag and the
      settings selected in the sidebar. The settings defined in the OLX's problem tag will be saved and
      corresponding values in the sidebar will be discarded.`,
    description: 'Explanation in body of mismatched settings modal',
  },
});

export default messages;
