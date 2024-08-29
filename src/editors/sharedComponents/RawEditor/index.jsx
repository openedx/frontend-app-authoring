import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from '@openedx/paragon';

import CodeEditor from '../CodeEditor';
import { setAssetToStaticUrl } from '../TinyMceWidget/hooks';

function getValue(content) {
  if (!content) { return null; }
  if (typeof content === 'string') { return content; }
  return content.data?.data;
}

const RawEditor = ({
  editorRef,
  content,
  lang,
}) => {
  const value = getValue(content) || '';
  const staticUpdate = setAssetToStaticUrl({ editorValue: value });

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
          value={staticUpdate}
          lang={lang}
          data-testid="code-editor"
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
