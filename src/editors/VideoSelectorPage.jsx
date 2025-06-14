import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import ErrorBoundary from './sharedComponents/ErrorBoundary';
import VideoSelector from './VideoSelector';
import store from './data/store';

const VideoSelectorPage = ({
  blockId,
  courseId,
  lmsEndpointUrl,
  studioEndpointUrl,
  returnFunction,
  onCancel,
}) => (
  <Provider store={store}>
    <ErrorBoundary
      {...{
        learningContextId: courseId,
        studioEndpointUrl,
      }}
    >
      <VideoSelector
        {...{
          blockId,
          learningContextId: courseId,
          lmsEndpointUrl,
          studioEndpointUrl,
          returnFunction,
          onCancel,
        }}
      />
    </ErrorBoundary>
  </Provider>
);

VideoSelectorPage.defaultProps = {
  blockId: null,
  courseId: null,
  lmsEndpointUrl: null,
  studioEndpointUrl: null,
};

VideoSelectorPage.propTypes = {
  blockId: PropTypes.string,
  courseId: PropTypes.string,
  lmsEndpointUrl: PropTypes.string,
  studioEndpointUrl: PropTypes.string,
  returnFunction: PropTypes.func,
  onCancel: PropTypes.func,
};

export default VideoSelectorPage;
