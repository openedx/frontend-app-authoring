import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from '@edx/paragon';

import CodeEditor from '../CodeEditor';

export const RawEditor = ({
  editorRef,
  text,
}) => (
  <div style={{ padding: '10px 30px', height: '600px' }}>
    <Alert variant="danger">
      You are using the raw HTML editor.
    </Alert>
    <CodeEditor
      innerRef={editorRef}
      value={text}
    />
  </div>
);
RawEditor.defaultProps = {
  editorRef: null,
};
RawEditor.propTypes = {
  editorRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
  text: PropTypes.string.isRequired,
};

export default RawEditor;
