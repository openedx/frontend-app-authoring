import React from 'react';
import PropTypes from 'prop-types';

const ThumbnailPreview = ({
  thumbnail,
  wrapperType,
  externalUrl,
  displayName,
  imageSize,
  id,
  status,
  thumbnailPreview,
}) => (
  <>
    {thumbnailPreview({
      thumbnail,
      wrapperType,
      externalUrl,
      displayName,
      imageSize,
      id,
      status,
    })}
  </>
);
ThumbnailPreview.defaultProps = {
  thumbnail: null,
  wrapperType: null,
  externalUrl: null,
  displayName: null,
  id: null,
  status: null,
};
ThumbnailPreview.propTypes = {
  thumbnail: PropTypes.string,
  wrapperType: PropTypes.string,
  externalUrl: PropTypes.string,
  displayName: PropTypes.string,
  id: PropTypes.string,
  status: PropTypes.string,
  thumbnailPreview: PropTypes.func.isRequired,
  imageSize: PropTypes.shape({
    height: PropTypes.string.isRequired,
    width: PropTypes.string.isRequired,
  }).isRequired,
};

export default ThumbnailPreview;
