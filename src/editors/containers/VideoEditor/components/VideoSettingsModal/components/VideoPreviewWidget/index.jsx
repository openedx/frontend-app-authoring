import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Collapsible, Image, Stack, Hyperlink,
} from '@openedx/paragon';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { selectors } from '../../../../../../data/redux';
import thumbnailMessages from '../ThumbnailWidget/messages';
import hooks from './hooks';
import LanguageNamesWidget from './LanguageNamesWidget';
import videoThumbnail from '../../../../../../data/images/videoThumbnail.svg';

// Exporting to test this component separately
export const VideoPreviewWidget = ({
  thumbnail,
  videoSource,
  transcripts,
  blockTitle,
  isLibrary,
  intl,
}) => {
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
            {!isLibrary && (
              // Since content libraries v2 don't support static assets yet, we can't include transcripts.
              <LanguageNamesWidget transcripts={transcripts} />
            )}
            {videoType && (
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

VideoPreviewWidget.propTypes = {
  intl: intlShape.isRequired,
  videoSource: PropTypes.string.isRequired,
  thumbnail: PropTypes.string.isRequired,
  transcripts: PropTypes.arrayOf(PropTypes.string).isRequired,
  blockTitle: PropTypes.string.isRequired,
  isLibrary: PropTypes.bool.isRequired,
};

export const mapStateToProps = (state) => ({
  transcripts: selectors.video.transcripts(state),
  videoSource: selectors.video.videoSource(state),
  thumbnail: selectors.video.thumbnail(state),
  blockTitle: selectors.app.blockTitle(state),
  isLibrary: selectors.app.isLibrary(state),
});

export default injectIntl(connect(mapStateToProps)(VideoPreviewWidget));
