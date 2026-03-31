import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  invalidUrl: {
    id: 'authoring.sharedComponents.uploadWidget.validators.invalidUrl',
    defaultMessage: 'Please enter a valid URL.',
    description: 'Error message when the user inputs a malformed URL.',
  },
  courseFileHint: {
    id: 'authoring.sharedComponents.uploadWidget.courseFileHint',
    defaultMessage: 'This is the file your learners will see embedded in your course. Files are immediately '
      + 'uploaded to course assets (Files).',
    description: 'Hint for file upload when in a course.',
  },
  libraryFileHint: {
    id: 'authoring.sharedComponents.uploadWidget.libraryFileHint',
    defaultMessage: 'This is the file your learners will see embedded in your block.',
    description: 'Hint for file upload when in a library.',
  },
  replaceFile: {
    id: 'authoring.sharedComponents.uploadWidget.replaceFile',
    defaultMessage: 'Replace',
    description: 'Dropdown menu item to replace an uploaded file.',
  },
  downloadFile: {
    id: 'authoring.sharedComponents.uploadWidget.downloadFile',
    defaultMessage: 'Download',
    description: 'Dropdown menu item to download the currently uploaded file for a block.',
  },
  manualUrl: {
    id: 'authoring.sharedComponents.uploadWidget.manualUrl',
    defaultMessage: 'Manually specify URL',
    description: "Dropdown menu item to switch to manually inputting a URL for a file's location.",
  },
  simpleMode: {
    id: 'authoring.sharedComponents.uploadWidget.simpleMode',
    defaultMessage: 'Simple Mode',
    description: 'Button text to switch to simple upload mode.',
  },
  fileTooLarge: {
    id: 'authoring.sharedComponents.uploadWidget.fileTooLarge',
    defaultMessage: 'Your file is too large.',
    description: 'Error message shown when an attempted file upload is too large.',
  },
  defaultName: {
    id: 'authoring.sharedComponents.uploadWidget.defaultName',
    defaultMessage: 'Unknown Filename',
    description: "Default 'file name' shown if one can't be determined.",
  },
  uploading: {
    id: 'authoring.sharedComponents.uploadWidget.uploading',
    defaultMessage: 'Uploading...',
    description: "Uploading status message to let the user know we're working on their request.",
  },
  uploadError: {
    id: 'authoring.sharedComponents.uploadWidget.uploadError',
    defaultMessage: 'There was an error uploading your file. Please try again later or contact support if the issue persists.',
    description: "Error message to show if there's been a problem with the file upload.",
  },
  actionsDropdown: {
    id: 'authoring.sharedComponents.uploadWidget.actionsDropdown',
    defaultMessage: 'Actions Dropdown',
    description: 'Accessible label for the dropdown menu activator.',
  },
  urlFieldLabel: {
    id: 'authoring.sharedComponents.uploadWidget.urlFieldLabel',
    defaultMessage: 'File URL',
    description: 'Label for the raw URL input mode.',
  },
  blockCreationWarning: {
    id: 'authoring.sharedComponents.uploadWidget.blockCreationWarning',
    defaultMessage: 'To add a file, save and reopen this block.',
    description: 'Notification that the user needs to save the block so we have somewhere to put '
      + 'the file before beginning.',
  },
});

export default messages;
