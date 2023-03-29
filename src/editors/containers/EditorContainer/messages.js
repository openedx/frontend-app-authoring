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
  okButtonLabel: {
    id: 'authoring.editorContainer.okButton.label',
    defaultMessage: 'OK',
    description: 'Label for OK button',
  },
});

export default messages;
