import React from 'react';
import PropTypes from 'prop-types';

import { thunkActions } from '../../../../data/redux';
// import VideoPreview from './components/VideoPreview';
import ErrorSummary from './components/ErrorSummary';
import DurationWidget from './components/DurationWidget';
import HandoutWidget from './components/HandoutWidget';
import LicenseWidget from './components/LicenseWidget';
import ThumbnailWidget from './components/ThumbnailWidget';
import TranscriptWidget from './components/TranscriptWidget';
import VideoSourceWidget from './components/VideoSourceWidget';
import './index.scss';

export const hooks = {
  onInputChange: (handleValue) => (e) => handleValue(e.target.value),
  onCheckboxChange: (handleValue) => (e) => handleValue(e.target.checked),
  onSave: (dispatch) => () => {
    dispatch(thunkActions.video.saveVideoData());
  },
};

export const VideoSettingsModal = ({
  error,
}) => (
  <div className="video-settings-modal row">
    <div className="video-preview col col-4">
      Video Preview goes here
      {/* <VideoPreview /> */}
    </div>
    <div className="video-controls col col-8">
      <ErrorSummary {...{ error }} />
      <h3>Settings</h3>
      <VideoSourceWidget error={error.videoSource} />
      <ThumbnailWidget error={error.thumbnail} />
      <TranscriptWidget error={error.transcripts} />
      <DurationWidget error={error.duration} />
      <HandoutWidget error={error.handout} />
      <LicenseWidget error={error.license} />
    </div>
  </div>
);

VideoSettingsModal.defaultProps = {
  error: {
    duration: {},
    handout: {},
    license: {},
    thumbnail: {},
    transcripts: {},
    videoSource: {},
  },
};
VideoSettingsModal.propTypes = {
  error: PropTypes.node,
};

export default VideoSettingsModal;
