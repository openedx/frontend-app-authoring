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
    { text && text.data.data ? (
      <CodeEditor
        innerRef={editorRef}
        value={text.data.data}
      />
    ) : null}

  </div>
);
RawEditor.defaultProps = {
  editorRef: null,
  text: null,
};
RawEditor.propTypes = {
  editorRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
  text: PropTypes.shape({
    data: PropTypes.shape({ data: PropTypes.string }),
  }),
};

export default RawEditor;
