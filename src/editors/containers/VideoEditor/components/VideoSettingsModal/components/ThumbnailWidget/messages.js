import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({

  title: {
    id: 'authoring.videoeditor.thumbnail.title',
    defaultMessage: 'Thumbnail',
    description: 'Title for thumbnail widget',
  },
  unavailableSubtitle: {
    id: 'authoring.videoeditor.thumbnail.unavailable.subtitle',
    defaultMessage: 'Unavailable',
    description: 'Subtitle for unavailable thumbnail widget',
  },
  noneSubtitle: {
    id: 'authoring.videoeditor.thumbnail.none.subtitle',
    defaultMessage: 'None',
    description: 'Subtitle for when no thumbnail has been uploaded to the widget',
  },
  yesSubtitle: {
    id: 'authoring.videoeditor.thumbnail.yes.subtitle',
    defaultMessage: 'Yes',
    description: 'Subtitle for when thumbnail has been uploaded to the widget',
  },
  unavailableMessage: {
    id: 'authoring.videoeditor.thumbnail.unavailable.message',
    defaultMessage:
      'Select a video from your library to enable this feature (applies only to courses that run on the edx.org site).',
    description: 'Message for unavailable thumbnail widget',
  },
  uploadButtonLabel: {
    id: 'authoring.videoeditor.thumbnail.upload.label',
    defaultMessage: 'Upload thumbnail',
    description: 'Label for upload button',
  },
  addThumbnail: {
    id: 'authoring.videoeditor.thumbnail.upload.message',
    defaultMessage: 'Upload an image for learners to see before playing the video.',
    description: 'Message for adding thumbnail',
  },
  aspectRequirements: {
    id: 'authoring.videoeditor.thumbnail.upload.aspectRequirements',
    defaultMessage: 'Images must have an aspect ratio of 16:9 (1280x720 px recommended)',
    description: 'Message for thumbnail aspectRequirements',
  },
  thumbnailAltText: {
    id: 'authoring.videoeditor.thumbnail.altText',
    defaultMessage: 'Image used as thumbnail for video',
    description: 'Alternative test for thumbnail',
  },
  deleteThumbnail: {
    id: 'authoring.videoeditor.thumbnail.deleteThumbnail',
    defaultMessage: 'Delete',
    description: 'Message presented to user for action to delete thumbnail',
  },
  fileSizeError: {
    id: 'authoring.videoeditor.thumbnail.error.fileSizeError',
    defaultMessage:
      'The file size for thumbnails must be larger than 2 KB or less than 2 MB. Please resize your image and try again.',
    description:
      ' Message presented to user when file size of image is less than 2 KB or larger than 2 MB',
  },
});

export default messages;
