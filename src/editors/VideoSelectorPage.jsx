import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import ErrorBoundary from './sharedComponents/ErrorBoundary';
import { VideoSelector } from './VideoSelector';
import store from './data/store';

const VideoSelectorPage = ({
  courseId,
  lmsEndpointUrl,
  studioEndpointUrl,
}) => (
  <ErrorBoundary>
    <Provider store={store}>
      <VideoSelector
        {...{
          learningContextId: courseId,
          lmsEndpointUrl,
          studioEndpointUrl,
        }}
      />
    </Provider>
  </ErrorBoundary>
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
