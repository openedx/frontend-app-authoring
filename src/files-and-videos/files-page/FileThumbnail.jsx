import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Icon,
  Image,
} from '@openedx/paragon';
import { getSrc } from './data/utils';
import messages from './messages';

const FileThumbnail = ({
  thumbnail,
  wrapperType,
  externalUrl,
  displayName,
  imageSize,
  // injected
  intl,
}) => {
  const src = getSrc({
    thumbnail,
    externalUrl,
    wrapperType,
  });
  const { width, height } = imageSize;

  return (
    <div className="row justify-content-center align-itmes-center">
      {thumbnail ? (
        <Image
          style={{
            width,
            height,
            objectFit: 'contain',
            maxWidth: '100%',
            maxHeight: '100%',
          }}
          className="border rounded p-1"
          src={src}
          alt={intl.formatMessage(messages.thumbnailAltMessage, { displayName })}
        />
      ) : (
        <div
          className="row justify-content-center align-items-center m-0 border rounded"
          style={imageSize}
        >
          <Icon src={src} style={{ height: '48px', width: '48px' }} />
        </div>
      )}
    </div>
  );
};
FileThumbnail.defaultProps = {
  thumbnail: null,
  wrapperType: null,
  externalUrl: null,
  displayName: null,
};
FileThumbnail.propTypes = {
  thumbnail: PropTypes.string,
  wrapperType: PropTypes.string,
  externalUrl: PropTypes.string,
  displayName: PropTypes.string,
  imageSize: PropTypes.shape({
    width: PropTypes.string,
    height: PropTypes.string.isRequired,
  }).isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(FileThumbnail);
