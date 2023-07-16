import React from 'react';
import PropTypes from 'prop-types';
import { connect, Provider } from 'react-redux';
import { createStore } from 'redux';
import { getConfig } from '@edx/frontend-platform';
import {
  prepareEditorRef,
  TinyMceWidget,
} from '@edx/frontend-lib-content-components';

const store = createStore(() => ({}));

export const SUPPORTED_TEXT_EDITORS = {
  text: 'text',
  expandable: 'expandable',
};

const mapStateToProps = () => ({
  assets: {},
  lmsEndpointUrl: getConfig().LMS_BASE_URL,
  studioEndpointUrl: getConfig().STUDIO_BASE_URL,
  isLibrary: {},
  onEditorChange: () => ({}),
});

const Editor = connect(mapStateToProps)(TinyMceWidget);

export const Wysiwyg = ({ initialValue, editorType, onChange }) => {
  const defaultEmptyTextValue = '<p>&nbsp;</p>';
  const { editorRef, refReady, setEditorRef } = prepareEditorRef();

  const isEquivalentCodeQuotes = (first, second) => {
    // Utils allows to compare code with single quotes and double quotes
    const normalizeQuotes = (section) => section.replace(/'/g, '"');
    return normalizeQuotes(first) === normalizeQuotes(second);
  };

  const needToChange = (value) => !isEquivalentCodeQuotes(initialValue, value)
    && (initialValue !== defaultEmptyTextValue || value !== '');

  const handleUpdate = (value, editor) => {
    // With bookmarks we keep the current cursor position at the end of the line
    // and it inserts new content only at the end of the line.
    const bm = editor.selection.getBookmark();
    const existingContent = editor.getContent({ format: 'raw' });
    if (needToChange(value)) { onChange(value); }
    editor.setContent(existingContent);
    editor.selection.moveToBookmark(bm);
  };

  if (!refReady) {
    return null;
  }

  return (
    <Provider store={store}>
      <Editor
        textValue={initialValue}
        editorRef={editorRef}
        editorType={editorType}
        initialValue={initialValue}
        minHeight={200}
        setEditorRef={setEditorRef}
        updateContent={handleUpdate}
        initializeEditor={() => ({})}
      />
    </Provider>
  );
};

Wysiwyg.defaultProps = {
  initialValue: '',
  editorType: SUPPORTED_TEXT_EDITORS.text,
};

Wysiwyg.propTypes = {
  initialValue: PropTypes.string,
  editorType: PropTypes.oneOf(Object.values(SUPPORTED_TEXT_EDITORS)),
  onChange: PropTypes.func.isRequired,
};
