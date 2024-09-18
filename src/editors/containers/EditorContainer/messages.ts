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
});

export default messages;
