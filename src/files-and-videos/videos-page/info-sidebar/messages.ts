import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  infoTabTitle: {
    id: 'course-authoring.video-uploads.file-info.infoTab.title',
    defaultMessage: 'Info',
    description: 'Title for info tab',
  },
  transcriptTabTitle: {
    id: 'course-authoring.video-uploads.file-info.transcriptTab.title',
    defaultMessage: 'Transcript ({transcriptCount})',
    description: 'Title for info tab',
  },
  notificationScreenReaderText: {
    id: 'course-authoring.video-uploads.file-info.transcriptTab.notification.screenReader.text',
    defaultMessage: 'Transcription error',
    description: 'Scrren reader text for transcript tab notification',
  },
  dateAddedTitle: {
    id: 'course-authoring.video-uploads.file-info.infoTab.dateAdded.title',
    defaultMessage: 'Date added',
    description: 'Title for date added section',
  },
  fileSizeTitle: {
    id: 'course-authoring.video-uploads.file-info.infoTab.fileSize.title',
    defaultMessage: 'File size',
    description: 'Title for file size section',
  },
  videoLengthTitle: {
    id: 'course-authoring.video-uploads.file-info.infoTab.videoLength.title',
    defaultMessage: 'Video length',
    description: 'Title for video length section',
  },
  errorAlertMessage: {
    id: 'course-authoring.files-and-upload.file-info.transcriptTab.errorAlert.message',
    defaultMessage: '{message}',
  },
  uploadButtonLabel: {
    id: 'course-authoriong.video-uploads.file-info.transcriptTab.upload.label',
    defaultMessage: 'Add a transcript',
    description: 'Label for upload button',
  },
  newTranscriptTitle: {
    id: 'course-authoriong.video-uploads.file-info.transcriptTab.newTranscript.title',
    defaultMessage: 'New transcript',
    description: 'Heading shown when adding a new transcript',
  },
  uploadFileLabel: {
    id: 'course-authoriong.video-uploads.file-info.transcriptTab.uploadFile.label',
    defaultMessage: 'Upload file',
    description: 'Label for selecting a transcript file',
  },
  uploadHelpText: {
    id: 'course-authoriong.video-uploads.file-info.transcriptTab.uploadFile.helpText',
    defaultMessage: 'SRT file, max 25MB',
    description: 'Help text shown under transcript upload button',
  },
  languageSelectPlaceholder: {
    id: 'course-authoriong.video-uploads.file-info.transcriptTab.languageSelectPlaceholder',
    defaultMessage: 'Select language',
    description: 'Placeholder for language selector in new transcript form',
  },
  cancelButtonLabel: {
    id: 'course-authoriong.video-uploads.file-info.transcriptTab.cancel.label',
    defaultMessage: 'Cancel',
    description: 'Cancel button text in new transcript form',
  },
  addTranscriptButtonLabel: {
    id: 'course-authoriong.video-uploads.file-info.transcriptTab.addTranscript.label',
    defaultMessage: 'Add transcript',
    description: 'Submit button label in new transcript form',
  },
  removeSelectedFileLabel: {
    id: 'course-authoriong.video-uploads.file-info.transcriptTab.removeSelectedFile.label',
    defaultMessage: 'Remove selected file',
    description: 'Accessible label for removing selected transcript file',
  },
  addTranscriptFailedLabel: {
    id: 'course-authoriong.video-uploads.file-info.transcriptTab.addTranscript.failed',
    defaultMessage: 'Upload failed, please try again',
    description: 'Inline error shown when adding transcript fails',
  },
  invalidSrtFormat: {
    id: 'course-authoriong.video-uploads.file-info.transcriptTab.invalidSrtFormat',
    defaultMessage: 'Invalid SRT format. Please upload a valid .srt file.',
    description: 'Error shown when uploaded transcript file has invalid SRT content',
  },
  newTranscriptAddedLabel: {
    id: 'course-authoriong.video-uploads.file-info.transcriptTab.addTranscript.success',
    defaultMessage: 'New transcript added',
    description: 'Toast message shown when adding transcript succeeds',
  },
});

export default messages;
