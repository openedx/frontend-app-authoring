import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({

  expandAltText: {
    id: 'authoring.videoeditor.expand',
    defaultMessage: 'Expand',
  },
  collapseAltText: {
    id: 'authoring.videoeditor.collapse',
    defaultMessage: 'Collapse',
  },
  validateErrorTitle: {
    id: 'authoring.videoeditor.validate.error.title',
    defaultMessage: 'We couldn\'t add your video.',
    description: 'Title of validation error.',
  },
  validateErrorBody: {
    id: 'authoring.videoeditor.validate.error.body',
    defaultMessage: 'Please check your entries and try again.',
    description: 'Body of validation error.',
  },
  durationTitle: {
    id: 'authoring.videoeditor.duration.title',
    defaultMessage: 'Duration',
    description: 'Title of Duration widget',
  },
  durationDescription: {
    id: 'authoring.videoeditor.duration.description',
    defaultMessage: 'Set a specific section of the video to play.',
    description: 'Description of Duration widget',
  },
  startTimeLabel: {
    id: 'authoring.videoeditor.duration.startTime.label',
    defaultMessage: 'Start time',
    description: 'Label of start time input field',
  },
  stopTimeLabel: {
    id: 'authoring.videoeditor.duration.stopTime.label',
    defaultMessage: 'Stop time',
    description: 'Label of stop time input field',
  },
  durationHint: {
    id: 'authoring.videoeditor.duration.hint',
    defaultMessage: 'Enter time as HH:MM:SS',
    description: 'Hint text for start and stop time input fields',
  },
  fullVideoLength: {
    id: 'authoring.videoeditor.duration.fullVideoLength',
    defaultMessage: 'Full video length',
    description: 'Text describing a video with neither custom start time nor custom stop time',
  },
  startsAt: {
    id: 'authoring.videoeditor.duration.startsAt',
    defaultMessage: 'Starts at {startTime}',
    description: 'Text describing a video with custom start time and default stop time',
  },
  total: {
    id: 'authoring.videoeditor.duration.total',
    defaultMessage: 'Total: {total}',
    description: 'Text describing a video with custom start time and custom stop time, or just a custom stop time',
  },
  custom: {
    id: 'authoring.videoeditor.duration.custom',
    defaultMessage: 'Custom: {total}',
    description: 'Text describing a video with custom start time and custom stop time, or just a custom stop time for a collapsed widget',
  },
  noTranscriptsAdded: {
    id: 'authoring.videoeditor.transcripts.empty',
    defaultMessage: 'No transcripts added',
    description: 'Message shown when the user has not selected any transcripts for the video.',
  },
  videoTypeYoutube: {
    id: 'authoring.videoeditor.videotype.youtube',
    defaultMessage: 'YouTube video',
    description: 'Shown on the preview card if the video is from youtube.com.',
  },
  videoTypeOther: {
    id: 'authoring.videoeditor.videotype.other',
    defaultMessage: 'Other video',
    description: 'Shown on the preview card if the video source could not be identified.',
  },
});

export default messages;
