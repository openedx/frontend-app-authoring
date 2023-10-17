import React from 'react';
import PropTypes from 'prop-types';
import {
  Icon,
  Image,
} from '@edx/paragon';
import { getSrc } from './data/utils';

const AssetThumbnail = ({
  thumbnail,
  wrapperType,
  externalUrl,
  displayName,
}) => {
  const src = getSrc({
    thumbnail,
    externalUrl,
    wrapperType,
  });

  return (
    <div className="row justify-content-center align-itmes-center">
      {thumbnail ? (
        <Image
          style={{
            width: '503px',
            height: '281px',
            objectFit: 'contain',
            maxWidth: '100%',
            maxHeight: '100%',
          }}
          className="border rounded p-1"
          src={src}
          alt={`Thumbnail of ${displayName}`}
        />
      ) : (
        <div
          className="row border justify-content-center align-items-center rounded m-0"
          style={{ width: '503px', height: '281px' }}
        >
          <Icon src={src} style={{ height: '48px', width: '48px' }} />
        </div>
      )}
    </div>
  );
};
AssetThumbnail.defaultProps = {
  thumbnail: null,
};
AssetThumbnail.propTypes = {
  thumbnail: PropTypes.string,
  wrapperType: PropTypes.string.isRequired,
  externalUrl: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
};

export default AssetThumbnail;
