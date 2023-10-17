import React from 'react';
import { PropTypes } from 'prop-types';
import { Image, Icon } from '@edx/paragon';
import { getSrc } from '../../data/utils';

const ThumbnailColumn = ({ row }) => {
  const {
    thumbnail,
    wrapperType,
    externalUrl,
  } = row.original;

  const src = getSrc({ thumbnail, wrapperType, externalUrl });
  return (
    <div className="row align-items-center justify-content-center m-0 p-3">
      {thumbnail ? (
        <Image
          src={src}
          style={{
            height: '76px',
            width: '135.71px',
            objectFit: 'contain',
            maxWidth: '100%',
            maxHeight: '100%',
          }}
          className="border rounded p-1"
        />
      ) : (
        <div className="row border justify-content-center align-items-center rounded m-0" style={{ height: '76px', width: '135.71px' }}>
          <Icon src={src} style={{ height: '48px', width: '48px' }} />
        </div>
      )}
    </div>
  );
};

ThumbnailColumn.propTypes = {
  row: {
    original: {
      thumbnail: PropTypes.string,
      wrapperType: PropTypes.string.isRequired,
      externalUrl: PropTypes.string,
    }.isRequired,
  }.isRequired,
};

export default ThumbnailColumn;
