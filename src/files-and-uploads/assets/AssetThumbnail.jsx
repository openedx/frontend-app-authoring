import React from 'react';
import PropTypes from 'prop-types';
import {
  Icon,
  Image,
} from '@edx/paragon';
import { getSrc } from '../data/utils';

const AssetThumbnail = ({
  thumbnail,
  wrapperType,
  externalUrl,
  displayName,
  imageSize,
}) => {
  const src = getSrc({
    thumbnail,
    externalUrl,
    wrapperType,
  });
  const { width, height } = imageSize;

  return (
    <div className="row border rounded p-1 justify-content-center align-itmes-center">
      {thumbnail ? (
        <Image
          style={{
            width,
            height,
            objectFit: 'contain',
            maxWidth: '100%',
            maxHeight: '100%',
          }}
          src={src}
          alt={`Thumbnail of ${displayName}`}
        />
      ) : (
        <div
          className="row justify-content-center align-items-center m-0"
          style={imageSize}
        >
          <Icon src={src} style={{ height: '48px', width: '48px' }} />
        </div>
      )}
    </div>
  );
};
AssetThumbnail.defaultProps = {
  thumbnail: null,
  wrapperType: null,
  externalUrl: null,
  displayName: null,
};
AssetThumbnail.propTypes = {
  thumbnail: PropTypes.string,
  wrapperType: PropTypes.string,
  externalUrl: PropTypes.string,
  displayName: PropTypes.string,
  imageSize: PropTypes.shape({
    width: PropTypes.string,
    height: PropTypes.string.isRequired,
  }).isRequired,
};

export default AssetThumbnail;
