import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  loadingSpinner: {
    id: 'InVideoQuizEditor.loadingSpinner',
    defaultMessage: 'Loading Spinner',
    description: 'Loading message for spinner screenreader text.',
  },
  title: {
    id: 'InVideoQuizEditor.title',
    defaultMessage: 'In-video quiz',
    description: 'Title for the in-video quiz editor.',
  },
  videoLabel: {
    id: 'InVideoQuizEditor.videoLabel',
    defaultMessage: 'Video',
    description: 'Label for video selector.',
  },
  selectVideo: {
    id: 'InVideoQuizEditor.selectVideo',
    defaultMessage: 'Select video',
    description: 'Placeholder for video dropdown.',
  },
  problemLabel: {
    id: 'InVideoQuizEditor.problemLabel',
    defaultMessage: 'Problem',
    description: 'Label for problem selector.',
  },
  selectProblem: {
    id: 'InVideoQuizEditor.selectProblem',
    defaultMessage: 'Select problem',
    description: 'Placeholder for problem dropdown.',
  },
  timeLabel: {
    id: 'InVideoQuizEditor.timeLabel',
    defaultMessage: 'Time',
    description: 'Label for time input.',
  },
  timeHelperText: {
    id: 'InVideoQuizEditor.timeHelperText',
    defaultMessage: 'Enter time as MM:SS',
    description: 'Helper text for time input.',
  },
  timeFormatError: {
    id: 'InVideoQuizEditor.timeFormatError',
    defaultMessage: 'Enter time as MM:SS',
    description: 'Validation error for invalid time format.',
  },
  jumpBackLabel: {
    id: 'InVideoQuizEditor.jumpBackLabel',
    defaultMessage: 'Jump back',
    description: 'Label for jump back input.',
  },
  jumpBackTooltip: {
    id: 'InVideoQuizEditor.jumpBackTooltip',
    defaultMessage: 'Choose the point in the video the learner should be taken back to if they need to review the material',
    description: 'Tooltip for jump back field.',
  },
  addProblem: {
    id: 'InVideoQuizEditor.addProblem',
    defaultMessage: 'Add problem',
    description: 'Button text for adding a new problem.',
  },
  addToCourse: {
    id: 'InVideoQuizEditor.addToCourse',
    defaultMessage: 'Add to course',
    description: 'Button text for adding to course (new xblock).',
  },
  save: {
    id: 'InVideoQuizEditor.save',
    defaultMessage: 'Save',
    description: 'Button text for saving (existing xblock).',
  },
  cancel: {
    id: 'InVideoQuizEditor.cancel',
    defaultMessage: 'Cancel',
    description: 'Button text for cancel.',
  },
  deleteProblem: {
    id: 'InVideoQuizEditor.deleteProblem',
    defaultMessage: 'Delete problem',
    description: 'Alt text for delete problem button.',
  },
  noneOption: {
    id: 'InVideoQuizEditor.noneOption',
    defaultMessage: 'None',
    description: 'None option for jump back dropdown.',
  },
  validationError: {
    id: 'InVideoQuizEditor.validationError',
    defaultMessage: 'Please select a video and at least one problem.',
    description: 'Validation error message.',
  },
  timemapParseError: {
    id: 'InVideoQuizEditor.timemapParseError',
    defaultMessage: 'Failed to parse quiz timemap data',
    description: 'Error message when timemap JSON parsing fails.',
  },
  jumpBackParseError: {
    id: 'InVideoQuizEditor.jumpBackParseError',
    defaultMessage: 'Failed to parse jump back data',
    description: 'Error message when jump back JSON parsing fails.',
  },
  saveErrorTitle: {
    id: 'InVideoQuizEditor.saveErrorTitle',
    defaultMessage: 'Error saving in-video quiz',
    description: 'Error alert title when saving fails.',
  },
  timerRequiredError: {
    id: 'InVideoQuizEditor.timerRequiredError',
    defaultMessage: 'Please enter a time for the selected problem.',
    description: 'Validation error when problem is selected but timer is missing.',
  },
  problemRequiredError: {
    id: 'InVideoQuizEditor.problemRequiredError',
    defaultMessage: 'Please select a problem for the entered time.',
    description: 'Validation error when timer is entered but problem is missing.',
  },
});

export default messages;
