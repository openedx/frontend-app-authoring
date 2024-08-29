import React from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import VideoGallery from './containers/VideoGallery';
import * as hooks from './hooks';

const VideoSelector = ({
  blockId,
  learningContextId,
  lmsEndpointUrl,
  studioEndpointUrl,
}) => {
  const dispatch = useDispatch();
  hooks.initializeApp({
    dispatch,
    data: {
      blockId,
      blockType: 'video',
      learningContextId,
      lmsEndpointUrl,
      studioEndpointUrl,
    },
  });
  return (
    <VideoGallery />
  );
};

VideoSelector.propTypes = {
  blockId: PropTypes.string.isRequired,
  learningContextId: PropTypes.string.isRequired,
  lmsEndpointUrl: PropTypes.string.isRequired,
  studioEndpointUrl: PropTypes.string.isRequired,
};

export default VideoSelector;
