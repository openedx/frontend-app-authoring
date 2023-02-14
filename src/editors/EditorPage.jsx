import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';

import store from './data/store';
import Editor from './Editor';
import ErrorBoundary from './sharedComponents/ErrorBoundary';

export const EditorPage = ({
  courseId,
  blockType,
  blockId,
  lmsEndpointUrl,
  studioEndpointUrl,
  onClose,
}) => (
  <ErrorBoundary>
    <Provider store={store}>
      <Editor
        {...{
          onClose,
          learningContextId: courseId,
          blockType,
          blockId,
          lmsEndpointUrl,
          studioEndpointUrl,
        }}
      />
    </Provider>
  </ErrorBoundary>
);
EditorPage.defaultProps = {
  blockId: null,
  courseId: null,
  lmsEndpointUrl: null,
  onClose: null,
  studioEndpointUrl: null,
};

EditorPage.propTypes = {
  blockId: PropTypes.string,
  blockType: PropTypes.string.isRequired,
  courseId: PropTypes.string,
  lmsEndpointUrl: PropTypes.string,
  onClose: PropTypes.func,
  studioEndpointUrl: PropTypes.string,
};

export default EditorPage;
