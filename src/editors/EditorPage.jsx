import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';

import store from './data/store';
import Editor from './Editor';

export const EditorPage = ({
  courseId,
  blockType,
  blockId,
  studioEndpointUrl,
}) => (
  <Provider store={store}>
    <Editor
      {...{
        courseId,
        blockType,
        blockId,
        studioEndpointUrl,
      }}
    />
  </Provider>
);
EditorPage.defaultProps = {
  courseId: null,
  blockId: null,
  studioEndpointUrl: null,
};

EditorPage.propTypes = {
  courseId: PropTypes.string,
  blockType: PropTypes.string.isRequired,
  blockId: PropTypes.string,
  studioEndpointUrl: PropTypes.string,
};

export default EditorPage;
