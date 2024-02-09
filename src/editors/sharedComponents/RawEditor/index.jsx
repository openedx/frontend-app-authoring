import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from '@openedx/paragon';

import CodeEditor from '../CodeEditor';

function getValue(content) {
  if (!content) { return null; }
  if (typeof content === 'string') { return content; }
  return content.data?.data;
}

export const RawEditor = ({
  editorRef,
  content,
  lang,
}) => {
  const value = getValue(content);

  return (
    <div>
      {lang === 'xml' ? null : (
        <Alert variant="danger">
          You are using the raw {lang} editor.
        </Alert>
      )}
      { value ? (
        <CodeEditor
          innerRef={editorRef}
          value={value}
          lang={lang}
        />
      ) : null}

    </div>
  );
};
RawEditor.defaultProps = {
  editorRef: null,
  content: null,
  lang: 'html',
};
RawEditor.propTypes = {
  editorRef: PropTypes.oneOfType([
    PropTypes.func,
    // eslint-disable-next-line react/forbid-prop-types
    PropTypes.shape({ current: PropTypes.any }),
  ]),
  content: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      data: PropTypes.shape({ data: PropTypes.string }),
    }),
  ]),
  lang: PropTypes.string,
};

export default RawEditor;
