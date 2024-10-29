import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({

  cancelConfirmTitle: {
    id: 'authoring.editorContainer.cancelConfirm.title',
    defaultMessage: 'Exit the editor?',
    description: 'Label for modal confirming cancellation',
  },
  cancelConfirmDescription: {
    id: 'authoring.editorContainer.cancelConfirm.description',
    defaultMessage: 'Are you sure you want to exit the editor? Any unsaved changes will be lost.',
    description: 'Description text for modal confirming cancellation',
  },
  exitButtonAlt: {
    id: 'authoring.editorContainer.exitButton.alt',
    defaultMessage: 'Exit the editor',
    description: 'Alt text for the Exit button',
  },
  okButtonLabel: {
    id: 'authoring.editorContainer.okButton.label',
    defaultMessage: 'OK',
    description: 'Label for OK button',
  },
  modalTitle: {
    id: 'authoring.editorContainer.accessibleTitle',
    defaultMessage: 'Editor Dialog',
    description: 'Text that labels the the editor modal dialog for non-visual users',
  },
  contentSaveFailed: {
    id: 'authoring.editorfooter.save.error',
    defaultMessage: 'Error: Content save failed. Please check recent changes and try again later.',
    description: 'Error message displayed when content fails to save.',
  },
  cancelButtonAriaLabel: {
    id: 'authoring.editorfooter.cancelButton.ariaLabel',
    defaultMessage: 'Discard changes and return to learning context',
    description: 'Screen reader label for cancel button',
  },
  cancelButtonLabel: {
    id: 'authoring.editorfooter.cancelButton.label',
    defaultMessage: 'Cancel',
    description: 'Label for cancel button',
  },
  saveButtonAriaLabel: {
    id: 'authoring.editorfooter.savebutton.ariaLabel',
    defaultMessage: 'Save changes and return to learning context',
    description: 'Screen reader label for save button',
  },
  saveButtonLabel: {
    id: 'authoring.editorfooter.savebutton.label',
    defaultMessage: 'Save',
    description: 'Label for Save button',
  },
});

export default messages;
