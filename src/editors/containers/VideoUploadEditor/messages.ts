import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  spinnerScreenReaderText: {
    id: 'authoring.videoUpload.spinnerScreenReaderText',
    defaultMessage: 'loading',
    description: 'Loading message for spinner screenreader text.',
  },
  dropVideoFileHere: {
    defaultMessage: 'Drag and drop video here or click to upload',
    id: 'VideoUploadEditor.dropVideoFileHere',
    description: 'Display message for Drag and Drop zone',
  },
  info: {
    id: 'VideoUploadEditor.uploadInfo',
    defaultMessage: 'Upload MP4 or MOV files (5 GB max)',
    description: 'Info message for supported formats',
  },
  pasteURL: {
    id: 'VideoUploadEditor.pasteURL',
    defaultMessage: 'Paste your video ID or URL',
    description: 'Paste URL message for video upload',
  },
  closeButtonAltText: {
    id: 'VideoUploadEditor.closeButtonAltText',
    defaultMessage: 'Close',
    description: 'Close button alt text',
  },
  submitButtonAltText: {
    id: 'VideoUploadEditor.submitButtonAltText',
    defaultMessage: 'Submit',
    description: 'Submit button alt text',
  },
});

export default messages;
