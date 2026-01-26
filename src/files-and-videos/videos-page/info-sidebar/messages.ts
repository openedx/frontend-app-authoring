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
});

export default messages;
