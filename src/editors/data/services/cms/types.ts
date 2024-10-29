import PropTypes from 'prop-types';

/*
export const videoDataProps = {
  videoSource: PropTypes.string,
  videoId: PropTypes.string,
  fallbackVideos: PropTypes.arrayOf(PropTypes.string),
  allowVideoDownloads: PropTypes.bool,
  allowVideoSharing: PropTypes.bool,
  thumbnail: PropTypes.string,
  transcripts: PropTypes.objectOf(PropTypes.string),
  allowTranscriptDownloads: PropTypes.bool,
  duration: PropTypes.shape({
    startTime: PropTypes.number,
    stopTime: PropTypes.number,
    total: PropTypes.number,
  }),
  showTranscriptByDefult: PropTypes.bool,
  handout: PropTypes.string,
  licenseType: PropTypes.string,
  licenseDetails: PropTypes.shape({
    attribution: PropTypes.bool,
    noncommercial: PropTypes.bool,
    noDerivatives: PropTypes.bool,
    shareAlike: PropTypes.bool,
  }),
};
*/

export const answerOptionProps = PropTypes.shape({
  id: PropTypes.string,
  title: PropTypes.string,
  correct: PropTypes.bool,
  feedback: PropTypes.string,
  selectedFeedback: PropTypes.string,
  unselectedFeedback: PropTypes.string,
});

/*
export const problemDataProps = {
  rawOLX: PropTypes.string,
  problemType: PropTypes.instanceOf(ProblemTypes),
  question: PropTypes.string,
  answers: PropTypes.arrayOf(
    answerOptionProps,
  ),
  settings: PropTypes.shape({
    scoring: PropTypes.shape({
      advanced: PropTypes.bool,
      scoring: PropTypes.shape({
        weight: PropTypes.number,
        attempts: PropTypes.shape({
          unlimited: PropTypes.bool,
          number: PropTypes.number,
        }),
      }),
    }),
    hints: PropTypes.arrayOf(PropTypes.string),
    timeBetween: PropTypes.number,
    showAnswer: PropTypes.shape({
      on: PropTypes.instanceOf(ShowAnswerTypes),
      afterAtempts: PropTypes.number,
    }),
    showResetButton: PropTypes.bool,
    defaultSettings: PropTypes.shape({
      max_attempts: PropTypes.number,
      showanswer: PropTypes.string,
      show_reset_button: PropTypes.bool,
      rerandomize: PropTypes.string,
    }),
  }),
};
*/

export default {
  answerOptionProps,
};
