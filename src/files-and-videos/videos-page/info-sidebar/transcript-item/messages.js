import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  fileSizeError: {
    id: 'course-authoriong.video-uploads.file-info.transcript.error.fileSizeError',
    defaultMessage: 'Transcript file size exeeds the maximum. Please try again.',
    description: 'Message presented to user when transcript file size is too large',
  },
  deleteTranscript: {
    id: 'course-authoriong.video-uploads.file-info.transcript.deleteTranscript',
    defaultMessage: 'Delete',
    description: 'Message Presented To user for action to delete transcript',
  },
  replaceTranscript: {
    id: 'course-authoriong.video-uploads.file-info.transcript.replaceTranscript',
    defaultMessage: 'Replace',
    description: 'Message Presented To user for action to replace transcript',
  },
  downloadTranscript: {
    id: 'course-authoriong.video-uploads.file-info.transcript.downloadTranscript',
    defaultMessage: 'Download',
    description: 'Message Presented To user for action to download transcript',
  },
  languageSelectPlaceholder: {
    id: 'course-authoriong.video-uploads.file-info.transcripts.languageSelectPlaceholder',
    defaultMessage: 'Select language',
    description: 'Placeholder For Dropdown, which allows users to set the language associtated with a transcript',
  },
  cancelDeleteLabel: {
    id: 'course-authoriong.video-uploads.file-info.transcripts.cancelDeleteLabel',
    defaultMessage: 'Cancel',
    description: 'Label For Button, which allows users to stop the process of deleting a transcript',
  },
  confirmDeleteLabel: {
    id: 'course-authoriong.video-uploads.file-info.transcripts.confirmDeleteLabel',
    defaultMessage: 'Delete',
    description: 'Label For Button, which allows users to confirm the process of deleting a transcript',
  },
  deleteConfirmationMessage: {
    id: 'course-authoriong.video-uploads.file-info.transcripts.deleteConfirmationMessage',
    defaultMessage: 'Are you sure you want to delete this transcript?',
    description: 'Warning which allows users to select next step in the process of deleting a transcript',
  },
  deleteConfirmationHeader: {
    id: 'course-authoriong.video-uploads.file-info.transcripts.deleteConfirmationTitle',
    defaultMessage: 'Delete this transcript?',
    description: 'Title for Warning which allows users to select next step in the process of deleting a transcript',
  },
});

export default messages;
