import React from 'react';
import { PropTypes } from 'prop-types';
import ThumbnailPreview from '../../ThumbnailPreview';

const ThumbnailColumn = ({ row, thumbnailPreview }) => {
  const {
    thumbnail,
    wrapperType,
    externalUrl,
    displayName,
    id,
    status,
  } = row.original;
  return (
    <ThumbnailPreview
      {...{
        thumbnail,
        wrapperType,
        externalUrl,
        displayName,
        id,
        status,
        thumbnailPreview,
        imageSize: { width: '120px', height: '67.5px' },
      }}
    />
  );
};

ThumbnailColumn.propTypes = {
  row: {
    original: {
      thumbnail: PropTypes.string,
      wrapperType: PropTypes.string.isRequired,
    }.isRequired,
  }.isRequired,
  thumbnailPreview: PropTypes.func.isRequired,
};

export default ThumbnailColumn;
