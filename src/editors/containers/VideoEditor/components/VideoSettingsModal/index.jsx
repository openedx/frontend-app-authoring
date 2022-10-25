import React from 'react';

// import VideoPreview from './components/VideoPreview';
import ErrorSummary from './ErrorSummary';
import DurationWidget from './components/DurationWidget';
import HandoutWidget from './components/HandoutWidget';
import LicenseWidget from './components/LicenseWidget';
import ThumbnailWidget from './components/ThumbnailWidget';
import TranscriptWidget from './components/TranscriptWidget';
import VideoSourceWidget from './components/VideoSourceWidget';
import './index.scss';

export const VideoSettingsModal = () => (
  <div className="video-settings-modal row">
    <div className="video-controls col mx-2">
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
