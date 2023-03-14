import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Collapsible, Icon, Image, Stack,
} from '@edx/paragon';
import { Launch } from '@edx/paragon/icons';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { selectors } from '../../../../../../data/redux';
import thumbnailMessages from '../ThumbnailWidget/messages';
import hooks from './hooks';
import LanguageNamesWidget from './LanguageNamesWidget';

export const VideoPreviewWidget = ({
  thumbnail,
  videoSource,
  transcripts,
  blockTitle,
  intl,
}) => {
  const imgRef = React.useRef();
  const videoType = intl.formatMessage(hooks.getVideoType(videoSource));

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
            className="mr-3"
            ref={imgRef}
            src={thumbnail}
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
            {videoType && (
              <a
                className="text-primary x-small"
                href={videoSource}
                target="_blank"
                rel="noopener noreferrer"
              >
                {videoType}
                <Icon
                  className="d-inline-block align-text-bottom pgn__icon__sm"
                  src={Launch}
                />
              </a>
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
};

export const mapStateToProps = (state) => ({
  transcripts: selectors.video.transcripts(state),
  videoSource: selectors.video.videoSource(state),
  thumbnail: selectors.video.thumbnail(state),
  blockTitle: selectors.app.blockTitle(state),
});

export default injectIntl(connect(mapStateToProps)(VideoPreviewWidget));
