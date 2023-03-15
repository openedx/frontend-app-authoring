import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import ErrorBoundary from './sharedComponents/ErrorBoundary';
import { Selector } from './Selector';
import store from './data/store';

const SelectorPage = ({
  courseId,
  lmsEndpointUrl,
  studioEndpointUrl,
}) => (
  <ErrorBoundary>
    <Provider store={store}>
      <Selector
        {...{
          learningContextId: courseId,
          lmsEndpointUrl,
          studioEndpointUrl,
        }}
      />
    </Provider>
  </ErrorBoundary>
);

SelectorPage.defaultProps = {
  courseId: null,
  lmsEndpointUrl: null,
  studioEndpointUrl: null,
};

SelectorPage.propTypes = {
  courseId: PropTypes.string,
  lmsEndpointUrl: PropTypes.string,
  studioEndpointUrl: PropTypes.string,
};

export default SelectorPage;
