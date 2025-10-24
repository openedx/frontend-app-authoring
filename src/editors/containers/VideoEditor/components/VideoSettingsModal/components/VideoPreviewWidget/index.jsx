import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Collapsible, Image, Stack, Hyperlink,
} from '@openedx/paragon';
import { useSelector } from 'react-redux';
import { selectors } from '../../../../../../data/redux';
import thumbnailMessages from '../ThumbnailWidget/messages';
import hooks from './hooks';
import LanguageNamesWidget from './LanguageNamesWidget';
import videoThumbnail from '../../../../../../data/images/videoThumbnail.svg';

// Exporting to test this component separately
export const VideoPreviewWidget = () => {
  const intl = useIntl();

  const transcripts = useSelector(selectors.video.transcripts);
  const videoSource = useSelector(selectors.video.videoSource);
  const thumbnail = useSelector(selectors.video.thumbnail);
  const blockTitle = useSelector(selectors.app.blockTitle);

  const imgRef = React.useRef();

  const videoType = intl.formatMessage(hooks.getVideoType(videoSource));

  const thumbnailImage = thumbnail || videoThumbnail;

  return (
    <Collapsible.Advanced
      className="collapsible-card rounded mx-4 my-3 px-4"
      defaultOpen
      open
    >
      <Collapsible.Body className="collapsible-body rounded px-0 py-4">
        <div className="d-flex flex-row">
          <Image
            thumbnail
            className="mr-3 px-6 py-4.5"
            ref={imgRef}
            src={thumbnailImage}
            alt={intl.formatMessage(thumbnailMessages.thumbnailAltText)}
            style={{
              maxWidth: '200px',
              minWidth: '200px',
              minHeight: '112px',
              maxHeight: '112px',
            }}
          />
          <Stack gap={1} className="justify-content-center">
            <h4 className="text-primary mb-0">{blockTitle}</h4>
            <LanguageNamesWidget transcripts={transcripts} />
            {videoType && videoSource && (
              <Hyperlink
                className="text-primary x-small"
                destination={videoSource}
                target="_blank"
                rel="noopener noreferrer"
              >
                {videoType}
              </Hyperlink>
            )}
          </Stack>
        </div>
      </Collapsible.Body>
    </Collapsible.Advanced>
  );
};

export default VideoPreviewWidget;
