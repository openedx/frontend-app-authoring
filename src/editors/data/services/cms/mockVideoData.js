import PropTypes from 'prop-types';
import LicenseTypes from '../../constants/licenses';

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

export const singleVideoData = {
  videoSource: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  fallbackVideos: [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  ],
  allowVideoDownloads: true,
  thumbnail: 'my-thumbnail-file-url', // filename
  transcripts: {
    english: 'my-transcript-url',
  },
  allowTranscriptDownloads: false,
  duration: {
    startTime: 0,
    stopTime: 0,
    total: 0,
  },
  showTranscriptByDefault: false,
  handout: 'my-handout-url',
  licenseType: LicenseTypes.creativeCommons,
  licenseDetails: {
    attribution: false,
    noncommercial: false,
    noDerivatives: false,
    shareAlike: false,
  },
};
