import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  invalidUrl: {
    id: 'authoring.pdfEditor.validators.invalidUrl',
    defaultMessage: 'Please enter a valid URL.',
    description: 'Error message when the user inputs a malformed URL.',
  },
  fileHint: {
    id: 'authoring.pdfEditor.widgets.uploadWidget.fileHint',
    defaultMessage: 'This is the file your learners will see embedded in your course.',
    description: 'Hint for PDF file upload.',
  },
  replaceFile: {
    id: 'authoring.pdfEditor.widgets.uploadWidget.replaceFile',
    defaultMessage: 'Replace',
    description: 'Dropdown menu item to replace an uploaded file.',
  },
  downloadFile: {
    id: 'authoring.pdfEditor.widgets.uploadWidget.downloadFile',
    defaultMessage: 'Download',
    description: 'Dropdown menu item to download the currently uploaded file for a block.',
  },
  manualUrl: {
    id: 'authoring.pdfEditor.widgets.uploadWidget.manualUrl',
    defaultMessage: 'Manually specify URL',
    description: "Dropdown menu item to switch to manually inputting a URL for a file's location.",
  },
  easyMode: {
    id: 'authoring.pdfEditor.widgets.uploadWidget.easyMode',
    defaultMessage: 'Easy Mode',
    description: 'Button text to switch to easy-upload mode.',
  },
  fileTooLarge: {
    id: 'authoring.pdfEditor.widgets.uploadWidget.fileTooLarge',
    defaultMessage: 'Your file is too large.',
    description: 'Error message shown when an attempted file upload is too large.',
  },
  defaultName: {
    id: 'authoring.pdfEditor.widgets.uploadWidget.defaultName',
    defaultMessage: 'Unknown.pdf',
    description: "Default 'file name' shown if one can't be determined.",
  },
  uploading: {
    id: 'authoring.pdfEditor.widgets.uploadWidget.uploading',
    defaultMessage: 'Uploading...',
    description: "Uploading status message to let the user know we're working on their request.",
  },
  uploadError: {
    id: 'authoring.pdfEditor.widgets.uploadWidget.uploadError',
    defaultMessage: 'There was an error uploading your file. Please try again later or contact support if the issue persists.',
    description: "Error message to show if there's been a problem with the file upload.",
  },
});

export default messages;
