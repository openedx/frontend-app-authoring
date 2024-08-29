import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({

  title: {
    id: 'authoring.videoeditor.transcripts.title',
    defaultMessage: 'Transcripts',
    description: 'Title for transcripts widget',
  },
  uploadButtonLabel: {
    id: 'authoring.videoeditor.transcripts.upload.label',
    defaultMessage: 'Add a transcript',
    description: 'Label for upload button',
  },
  addFirstTranscript: {
    id: 'authoring.videoeditor.transcripts.upload.firstTranscriptMessage',
    defaultMessage: 'Add video transcripts (.srt files only) for improved accessibility.',
    description: 'Message for adding first transcript',
  },
  allowDownloadCheckboxLabel: {
    id: 'authoring.videoeditor.transcripts.allowDownloadCheckboxLabel',
    defaultMessage: 'Allow transcript downloads',
    description: 'Label for allow transcript downloads checkbox',
  },
  showByDefaultCheckboxLabel: {
    id: 'authoring.videoeditor.transcripts.upload.showByDefaultCheckboxLabel',
    defaultMessage: 'Show transcript in the video player by default',
    description: 'Label for show by default checkbox',
  },
  tooltipMessage: {
    id: 'authoring.videoeditor.transcripts.upload.allowDownloadTooltipMessage',
    defaultMessage: 'Learners will see a link to download the transcript below the video.',
    description: 'Message for show by default checkbox',
  },
  transcriptTypeError: {
    id: 'authoring.videoeditor.transcript.error.transcriptTypeError',
    defaultMessage: 'Only SRT file can be uploaded',
    description: 'Message presented to user when image fails to upload',
  },
  uploadTranscriptError: {
    id: 'authoring.videoeditor.transcript.error.uploadTranscriptError',
    defaultMessage: 'Failed to upload transcript. Please try again.',
    description: 'Message presented to user when transcript fails to upload',
  },
  fileSizeError: {
    id: 'authoring.videoeditor.transcript.error.fileSizeError',
    defaultMessage: 'Transcript file size exeeds the maximum. Please try again.',
    description: 'Message presented to user when transcript file size is too large',
  },
  deleteTranscript: {
    id: 'authoring.videoeditor.transcript.deleteTranscript',
    defaultMessage: 'Delete',
    description: 'Message Presented To user for action to delete transcript',
  },
  deleteTranscriptError: {
    id: 'authoring.videoeditor.transcript.error.deleteTranscriptError',
    defaultMessage: 'Failed to delete transcript. Please try again.',
    description: 'Message presented to user when transcript fails to delete',
  },
  replaceTranscript: {
    id: 'authoring.videoeditor.transcript.replaceTranscript',
    defaultMessage: 'Replace',
    description: 'Message Presented To user for action to replace transcript',
  },
  downloadTranscript: {
    id: 'authoring.videoeditor.transcript.downloadTranscript',
    defaultMessage: 'Download',
    description: 'Message Presented To user for action to download transcript',
  },
  languageSelectLabel: {
    id: 'authoring.videoeditor.transcripts.languageSelectLabel',
    defaultMessage: 'Languages',
    description: 'Label For Dropdown, which allows users to set the language associtated with a transcript',
  },
  languageSelectPlaceholder: {
    id: 'authoring.videoeditor.transcripts.languageSelectPlaceholder',
    defaultMessage: 'Select Language',
    description: 'Placeholder For Dropdown, which allows users to set the language associtated with a transcript',
  },
  cancelDeleteLabel: {
    id: 'authoring.videoeditor.transcripts.cancelDeleteLabel',
    defaultMessage: 'Cancel',
    description: 'Label For Button, which allows users to stop the process of deleting a transcript',
  },
  confirmDeleteLabel: {
    id: 'authoring.videoeditor.transcripts.confirmDeleteLabel',
    defaultMessage: 'Delete',
    description: 'Label For Button, which allows users to confirm the process of deleting a transcript',
  },
  deleteConfirmationMessage: {
    id: 'authoring.videoeditor.transcripts.deleteConfirmationMessage',
    defaultMessage: 'Are you sure you want to delete this transcript?',
    description: 'Warning which allows users to select next step in the process of deleting a transcript',
  },
  deleteConfirmationHeader: {
    id: 'authoring.videoeditor.transcripts.deleteConfirmationTitle',
    defaultMessage: 'Delete this transcript?',
    description: 'Title for Warning which allows users to select next step in the process of deleting a transcript',
  },
  fileTypeWarning: {
    id: 'authoring.videoeditor.transcripts.fileTypeWarning',
    defaultMessage: 'Only SRT files can be uploaded. Please select a file ending in .srt to upload.',
    description: 'Message warning users to only upload .srt files',
  },
  importButtonLabel: {
    id: 'authoring.videoEditor.transcripts.importButton.label',
    defaultMessage: 'Import Transcript',
    description: 'Label for youTube import transcript button',
  },
  importHeader: {
    id: 'authoring.videoEditor.transcripts.importCard.header',
    defaultMessage: 'Import transcript from YouTube?',
    description: 'Header for import transcript card',
  },
  importMessage: {
    id: 'authoring.videoEditor.transcrtipts.importCard.message',
    defaultMessage: 'We found transcript for this video on YouTube. Would you like to import it now?',
    description: 'Message for import transcript card asking user if they want to import transcript',
  },
});

export default messages;
