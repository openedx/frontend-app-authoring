import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  loadingSpinner: {
    id: 'InVideoQuizEditor.loadingSpinner',
    defaultMessage: 'Loading Spinner',
    description: 'Loading message for spinner screenreader text.',
  },
  loadError: {
    id: 'InVideoQuizEditor.loadError',
    defaultMessage: 'Could not load this in-video quiz. Close the editor and try again.',
    description: 'Shown when the quiz settings or the unit contents fail to load.',
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
  timeInputPlaceholder: {
    id: 'InVideoQuizEditor.timeInputPlaceholder',
    defaultMessage: '00:00',
    description: 'Placeholder shown in the empty time and jump-back inputs, in MM:SS format.',
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
  deleteProblem: {
    id: 'InVideoQuizEditor.deleteProblem',
    defaultMessage: 'Delete problem',
    description: 'Alt text for delete problem button.',
  },
  saveErrorTitle: {
    id: 'InVideoQuizEditor.saveErrorTitle',
    defaultMessage: 'Error saving in-video quiz',
    description: 'Error alert title shown for client-side validation failures.',
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
  videoRequiredError: {
    id: 'InVideoQuizEditor.videoRequiredError',
    defaultMessage: 'Please select a video.',
    description: 'Validation error when a problem/time is configured but no video is selected.',
  },
  videoAndProblemRequiredError: {
    id: 'InVideoQuizEditor.videoAndProblemRequiredError',
    defaultMessage: 'Please select a video and add at least one problem.',
    description: 'Validation error when saving with nothing configured at all (no video, no problem, no time).',
  },
  noProblemsAddedError: {
    id: 'InVideoQuizEditor.noProblemsAddedError',
    defaultMessage: 'Please add at least one problem.',
    description: 'Validation error when a video is selected but no problem has been added.',
  },
  contentNotFoundTitle: {
    id: 'InVideoQuizEditor.contentNotFoundTitle',
    defaultMessage: 'Content not found',
    description: 'Alert heading when required content is missing from the unit.',
  },
  noVideoFoundInUnit: {
    id: 'InVideoQuizEditor.noVideoFoundInUnit',
    defaultMessage: 'No video found for this unit',
    description: 'Alert shown when no video components exist in the unit.',
  },
  noProblemFoundInUnit: {
    id: 'InVideoQuizEditor.noProblemFoundInUnit',
    defaultMessage: 'No problem found for this unit',
    description: 'Alert shown when no problem components exist in the unit.',
  },
});

export default messages;
