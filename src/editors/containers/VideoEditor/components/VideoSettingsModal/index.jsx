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
  <>
    <ErrorSummary />
    <VideoSourceWidget />
    <ThumbnailWidget />
    <TranscriptWidget />
    <DurationWidget />
    <HandoutWidget />
    <LicenseWidget />
  </>
);

export default VideoSettingsModal;
