import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  blockFailed: {
    id: 'authoring.pdfEditor.blockFailed',
    defaultMessage: 'PDF block failed to load',
    description: 'Error message for PDF block failing to load',
  },
  blockLoading: {
    id: 'authoring.pdfEditor.blockLoading',
    defaultMessage: 'Loading PDF Editor',
    description: 'Message shown to screen readers when the PDF block is loading.',
  },
});

export default messages;
