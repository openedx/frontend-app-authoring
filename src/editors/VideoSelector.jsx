import React from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import VideoGallery from './containers/VideoGallery';
import * as hooks from './hooks';

export const VideoSelector = ({
  learningContextId,
  lmsEndpointUrl,
  studioEndpointUrl,
}) => {
  const dispatch = useDispatch();
  hooks.initializeApp({
    dispatch,
    data: {
      blockId: '',
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
  learningContextId: PropTypes.string.isRequired,
  lmsEndpointUrl: PropTypes.string.isRequired,
  studioEndpointUrl: PropTypes.string.isRequired,
};

export default VideoSelector;
