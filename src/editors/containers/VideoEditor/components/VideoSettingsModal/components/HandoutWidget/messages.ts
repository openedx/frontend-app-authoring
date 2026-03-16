import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({

  titleLabel: {
    id: 'authoring.videoeditor.handout.title.label',
    defaultMessage: 'Handout',
    description: 'Title for the handout widget',
  },
  uploadButtonLabel: {
    id: 'authoring.videoeditor.handout.upload.label',
    defaultMessage: 'Upload Handout',
    description: 'Label for upload button',
  },
  addHandoutMessage: {
    id: 'authoring.videoeditor.handout.upload.addHandoutMessage',
    defaultMessage: `Add a handout to accompany this video. Learners can download
    this file by clicking "Download Handout" below the video.`,
    description: 'Message displayed when uploading a handout',
  },
  uploadHandoutError: {
    id: 'authoring.videoeditor.handout.error.uploadHandoutError',
    defaultMessage: 'Failed to upload handout. Please try again.',
    description: 'Message presented to user when handout fails to upload',
  },
  fileSizeError: {
    id: 'authoring.videoeditor.handout.error.fileSizeError',
    defaultMessage: 'Handout files must be 20 MB or less. Please resize the file and try again.',
    description: 'Message presented to user when handout file size is larger than 20 MB',
  },
  handoutHelpMessage: {
    id: 'authoring.videoeditor.handout.handoutHelpMessage',
    defaultMessage: 'Learners can download this file by clicking "Download Handout" below the video.',
    description: 'Message presented to user when a handout is present',
  },
  deleteHandout: {
    id: 'authoring.videoeditor.handout.deleteHandout',
    defaultMessage: 'Delete',
    description: 'Message Presented To user for action to delete handout',
  },
  replaceHandout: {
    id: 'authoring.videoeditor.handout.replaceHandout',
    defaultMessage: 'Replace',
    description: 'Message Presented To user for action to replace handout',
  },
  downloadHandout: {
    id: 'authoring.videoeditor.handout.downloadHandout',
    defaultMessage: 'Download',
    description: 'Message Presented To user for action to download handout',
  },
});

export default messages;
