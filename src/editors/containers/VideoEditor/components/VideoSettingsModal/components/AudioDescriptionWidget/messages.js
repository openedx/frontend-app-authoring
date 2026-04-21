import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  // Widget section title in the collapsible panel
  titleLabel: {
    id: 'authoring.videoeditor.audioDescription.title.label',
    defaultMessage: 'Audio Description (AD)',
    description: 'Title for the audio description widget',
  },
  // Label on the upload button when no file is present
  uploadButtonLabel: {
    id: 'authoring.videoeditor.audioDescription.upload.label',
    defaultMessage: 'Upload Audio Description',
    description: 'Label for the audio description upload button',
  },
  // Instruction shown before an audio description has been uploaded
  addAudioDescriptionMessage: {
    id: 'authoring.videoeditor.audioDescription.upload.addMessage',
    defaultMessage: `Add an audio description track (MP3, OGG, M4A, WAV, or AAC) to provide narrated
    descriptions of visual content for learners who are blind or have low vision.`,
    description: 'Message displayed when no audio description is uploaded',
  },
  // Error message when the audio description file upload fails
  uploadError: {
    id: 'authoring.videoeditor.audioDescription.error.uploadError',
    defaultMessage: 'Failed to upload audio description. Please try again.',
    description: 'Message presented to user when audio description upload fails',
  },
  // Error message when file exceeds the 200 MB size limit
  fileSizeError: {
    id: 'authoring.videoeditor.audioDescription.error.fileSizeError',
    defaultMessage: 'Audio description files must be 200 MB or less. Please resize the file and try again.',
    description: 'Message presented when audio description file exceeds 200 MB',
  },
  // Error message when an unsupported file format is selected
  fileTypeError: {
    id: 'authoring.videoeditor.audioDescription.error.fileTypeError',
    defaultMessage: 'Only MP3, OGG, M4A, WAV, and AAC files are supported for audio descriptions.',
    description: 'Message presented when wrong file type is selected',
  },
  // Help text shown below the uploaded file name
  helpMessage: {
    id: 'authoring.videoeditor.audioDescription.helpMessage',
    defaultMessage: 'Learners can toggle the audio description track using the player controls.',
    description: 'Help message shown when an audio description is present',
  },
  // Button label to delete the current file
  deleteAudioDescription: {
    id: 'authoring.videoeditor.audioDescription.deleteAudioDescription',
    defaultMessage: 'Delete',
    description: 'Action to delete the audio description file',
  },
  // Warning shown when AD track duration differs from video duration by more than 1 second
  durationMismatchWarning: {
    id: 'authoring.videoeditor.audioDescription.durationMismatchWarning',
    defaultMessage: 'Warning: The audio description file duration differs from the video duration by more than 1 second.',
    description: 'Warning shown when audio description duration does not match video duration',
  },
  // Label shown on the upload spinner overlay during upload
  uploadingLabel: {
    id: 'authoring.videoeditor.audioDescription.uploading.label',
    defaultMessage: 'Uploading…',
    description: 'Spinner label shown while audio description upload is in progress',
  },
});

export default messages;
