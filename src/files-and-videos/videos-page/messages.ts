import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  heading: {
    id: 'course-authoring.video-uploads.heading',
    defaultMessage: 'Videos',
    description: 'Title of the page',
  },
  transcriptSettingsButtonLabel: {
    id: 'course-authoring.video-uploads.transcript-settings.button.toggle',
    defaultMessage: 'Transcript settings',
    description: 'Button text for transcript settings button',
  },
  thumbnailAltMessage: {
    id: 'course-authoring.video-uploads.thumbnail.alt',
    defaultMessage: '{displayName} video thumbnail',
    description: 'Alternative text for video thumbnail image',
  },
  activeCheckboxLabel: {
    id: 'course-authoring.files-and-videos.sort-and-filter.modal.filter.activeCheckbox.label',
    defaultMessage: 'Active',
    description: 'Checkbox label for Active checkbox in sort and filter modal',
  },
  inactiveCheckboxLabel: {
    id: 'course-authoring.files-and-videos.sort-and-filter.modal.filter.inactiveCheckbox.label',
    defaultMessage: 'Inactive',
    description: 'Checkbox label for Inactive checkbox in sort and filter modal',
  },
  transcribedCheckboxLabel: {
    id: 'course-authoring.files-and-videos.sort-and-filter.modal.filter.transcribedCheckbox.label',
    defaultMessage: 'Transcribed',
    description: 'Checkbox label for Transcribed checkbox in sort and filter modal',
  },
  notTranscribedCheckboxLabel: {
    id: 'course-authoring.files-and-videos.sort-and-filter.modal.filter.notTranscribedCheckbox.label',
    defaultMessage: 'Not transcribed',
    description: 'Checkbox label for Not transcribed checkbox in sort and filter modal',
  },
  processingCheckboxLabel: {
    id: 'course-authoring.files-and-videos.sort-and-filter.modal.filter.processingCheckbox.label',
    defaultMessage: 'Processing',
    description: 'Checkbox label for Processing checkbox in sort and filter modal',
  },
  failedCheckboxLabel: {
    id: 'course-authoring.files-and-videos.sort-and-filter.modal.filter.failedCheckbox.label',
    defaultMessage: 'Failed',
    description: 'Checkbox label for Failed checkbox in sort and filter modal',
  },
  videoUploadAlertLabel: {
    id: 'course-authoring.files-and-videos.video-upload-alert',
    defaultMessage: 'Upload in progress. Please wait for the upload to complete before navigating away from this page.',
    description: 'Message for video upload alert',
  },
  videoUploadTrackerModalTitle: {
    id: 'course-authoring.files-and-videos.video-upload-tracker-modal.title',
    defaultMessage: 'Upload in progress',
    description: 'Title for the Upload Tracker Modal',
  },
  videoUploadTrackerAlertTitle: {
    id: 'course-authoring.files-and-videos.video-upload-tracker-alert.title',
    defaultMessage: 'Do not close or refresh this page or tab until uploads are complete',
    description: 'Title for the Upload Tracker Alert',
  },
  videoUploadTrackerAlertBodyMessage: {
    id: 'course-authoring.files-and-videos.video-upload-tracker-alert.body.message',
    defaultMessage: 'Exiting now will delete all upload progress. This pop-up will close upon successful upload.',
    description: 'Body text for the Upload Tracker Alert',
  },
  videoUploadTrackerAlertEditMessage: {
    id: 'course-authoring.files-and-videos.video-upload-tracker-alert.edit.message',
    defaultMessage: 'Want to continue editing in Studio during this upload?',
    description: 'Continue editing message for the Upload Tracker Alert',
  },
  videoUploadTrackerAlertEditHyperlinkLabel: {
    id: 'course-authoring.files-and-videos.video-upload-tracker-alert.edit-hyperlink.message',
    defaultMessage: 'Open new Studio tab',
    description: 'Label for hyperlink to open a new tab',
  },
  videoUploadTrackerModalBody: {
    id: 'course-authoring.files-and-videos.video-upload-tracker-modal.body.message',
    defaultMessage: 'The following ({uploadCount}) {uploadCount, plural, one {video is} other {videos are}} being uploaded:',
    description: 'Message for upload tracker modal body',
  },
  videoUploadTrackerAlertCancelLabel: {
    id: 'course-authoring.files-and-videos.video-upload-tracker-alert.cancel-button.label',
    defaultMessage: 'Cancel uploads',
    description: 'Label for cancel button',
  },
});

export default messages;
