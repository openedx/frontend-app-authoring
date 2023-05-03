import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import ErrorBoundary from './sharedComponents/ErrorBoundary';
import VideoSelector from './VideoSelector';
import store from './data/store';

const VideoSelectorPage = ({
  courseId,
  lmsEndpointUrl,
  studioEndpointUrl,
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
          learningContextId: courseId,
          lmsEndpointUrl,
          studioEndpointUrl,
        }}
      />
    </ErrorBoundary>
  </Provider>
);

VideoSelectorPage.defaultProps = {
  courseId: null,
  lmsEndpointUrl: null,
  studioEndpointUrl: null,
};

VideoSelectorPage.propTypes = {
  courseId: PropTypes.string,
  lmsEndpointUrl: PropTypes.string,
  studioEndpointUrl: PropTypes.string,
};

export default VideoSelectorPage;
