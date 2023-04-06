import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({

  titleLabel: {
    id: 'authoring.videoeditor.videoSource.title.label',
    defaultMessage: 'Video source',
    description: 'Title for the video source widget',
  },
  videoIdLabel: {
    id: 'authoring.videoeditor.videoSource.videoId.label',
    defaultMessage: 'Video ID',
    description: 'Label for video ID field',
  },
  videoIdFeedback: {
    id: 'authoring.videoeditor.videoSource.videoId.feedback',
    defaultMessage: 'If you were assigned a video ID by edX, enter the ID here.',
    description: 'Feedback for video ID field',
  },
  videoUrlLabel: {
    id: 'authoring.videoeditor.videoSource.videoUrl.label',
    defaultMessage: 'Video URL',
    description: 'Label for video URL field',
  },
  videoUrlFeedback: {
    id: 'authoring.videoeditor.videoSource.videoUrl.feedback',
    defaultMessage: `The URL for your video. This can be a YouTube URL, or a link
    to an .mp4, .ogg, or .webm video file hosted elsewhere on the internet.`,
    description: 'Feedback for video URL field',
  },
  videoIdChangeAlert: {
    id: 'authoring.videoeditor.videoIdChangeAlert.message',
    defaultMessage: 'The Video ID field has changed, please check the Video URL and fallback URL values and update them if necessary.',
    description: 'Body message for the alert that appears when the video id has been changed.',
  },
  fallbackVideoTitle: {
    id: 'authoring.videoeditor.videoSource.fallbackVideo.title',
    defaultMessage: 'Fallback videos',
    description: 'Title for the fallback videos section',
  },
  fallbackVideoMessage: {
    id: 'authoring.videoeditor.videoSource.fallbackVideo.message',
    defaultMessage: `To be sure all learners can access the video, edX
    recommends providing additional videos in both .mp4 and
    .webm formats.  The first listed video compatible with the
    learner's device will play.`,
    description: 'Test explaining reason for fallback videos',
  },
  fallbackVideoLabel: {
    id: 'authoring.videoeditor.videoSource.fallbackVideo.label',
    defaultMessage: 'Video URL',
    description: 'Label for fallback video url field',
  },
  deleteFallbackVideo: {
    id: 'authoring.videoeditor.videoSource.deleteFallbackVideo',
    defaultMessage: 'Delete',
    description: 'Message Presented To user for action to delete fallback video',
  },
  allowDownloadCheckboxLabel: {
    id: 'authoring.videoeditor.videoSource.allowDownloadCheckboxLabel',
    defaultMessage: 'Allow video downloads',
    description: 'Label for allow video downloads checkbox',
  },
  allowDownloadTooltipMessage: {
    id: 'authoring.videoeditor.videoSource.allowDownloadTooltipMessage',
    defaultMessage: `Allow learners to download versions of this video in
    different formats if they cannot use the edX video player or do not have
    access to YouTube.`,
    description: 'Message for allow video downloads checkbox',
  },
  allowVideoSharingCheckboxLabel: {
    id: 'authoring.videoeditor.videoSource.allowVideoSharingCheckboxLabel',
    defaultMessage: 'Allow this video to be shared on social media.',
    description: 'Label for allow shareable video checkbox',
  },
  allowVideoSharingTooltipMessage: {
    id: 'authoring.videoeditor.videoSource.allowVideoSharingTooltipMessage',
    defaultMessage: `Allow learners to share this video publicly on social media.
    The video will be viewable by anyone, they will not need to enroll in the course
    or even have an edX account. Links to the course about page and to enroll in the 
    course will appear alongside the video.`,
    description: 'Message for allow shareable video checkbox',
  },
  addButtonLabel: {
    id: 'authoring.videoeditor.videoSource.fallbackVideo.addButtonLabel',
    defaultMessage: 'Add a video URL',
    description: 'Label for add a video URL button',
  },
});

export default messages;
