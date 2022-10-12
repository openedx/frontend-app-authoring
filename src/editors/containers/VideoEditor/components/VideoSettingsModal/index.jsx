import React from 'react';

import { thunkActions } from '../../../../data/redux';
// import VideoPreview from './components/VideoPreview';
import ErrorSummary from './ErrorSummary';
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

export const VideoSettingsModal = () => (
  <div className="video-settings-modal row">
    <div className="video-preview col col-4">
      Video Preview goes here
      {/* <VideoPreview /> */}
    </div>
    <div className="video-controls col col-8">
      <ErrorSummary />
      <h3>Settings</h3>
      <VideoSourceWidget />
      <ThumbnailWidget />
      <TranscriptWidget />
      <DurationWidget />
      <HandoutWidget />
      <LicenseWidget />
    </div>
  </div>
);

export default VideoSettingsModal;
