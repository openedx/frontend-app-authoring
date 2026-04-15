import React from 'react';
import { Button, Icon } from '@openedx/paragon';
import { ArrowBackIos } from '@openedx/paragon/icons';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

// import VideoPreview from './components/VideoPreview';
import { ErrorSummary } from './ErrorSummary';
import DurationWidget from './components/DurationWidget';
import HandoutWidget from './components/HandoutWidget';
import LicenseWidget from './components/LicenseWidget';
import ThumbnailWidget from './components/ThumbnailWidget';
import TranscriptWidget from './components/TranscriptWidget';
import VideoSourceWidget from './components/VideoSourceWidget';
// Using default import to get selectors connected VideoSourceWidget
import ConnectedVideoPreviewWidget from './components/VideoPreviewWidget';
import AudioDescriptionWidget from './components/AudioDescriptionWidget';
import './index.scss';
import SocialShareWidget from './components/SocialShareWidget';
import messages from '../../messages';
import { useEditorContext } from '../../../../EditorContext';

interface Props {
  onReturn: () => void;
  isLibrary: boolean;
  onClose?: (() => void) | null;
}

const VideoSettingsModal: React.FC<Props> = ({
  onReturn,
  isLibrary,
  onClose,
}) => {
  const { isAudioDescriptionEnabled } = useEditorContext();
  return (
    <>
      {!isLibrary && (
        <Button
          variant="link"
          className="text-primary-500 video-settings-back-btn"
          size="sm"
          onClick={onClose || onReturn}
        >
          <Icon src={ArrowBackIos} className="video-settings-back-icon" />
          <FormattedMessage {...messages.replaceVideoButtonLabel} />
        </Button>
      )}
      <ErrorSummary />
      <ConnectedVideoPreviewWidget />
      <VideoSourceWidget />
      {!isLibrary && (
        <SocialShareWidget />
      )}
      <ThumbnailWidget />
      <TranscriptWidget />
      {isAudioDescriptionEnabled && !isLibrary && <AudioDescriptionWidget />}
      <DurationWidget />
      <HandoutWidget />
      <LicenseWidget />
    </>
  );
};

export default VideoSettingsModal;
