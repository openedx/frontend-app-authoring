import PropTypes from 'prop-types';

export const videoDataProps = {
  videoSource: PropTypes.string,
  fallbackVideos: PropTypes.arrayOf(PropTypes.string),
  allowVideoDownloads: PropTypes.bool,
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

export default {
  videoDataProps,
};
