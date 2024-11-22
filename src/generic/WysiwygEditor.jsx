import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import TinyMceWidget, { prepareEditorRef } from '../editors/sharedComponents/TinyMceWidget';

import { DEFAULT_EMPTY_WYSIWYG_VALUE } from '../constants';

export const SUPPORTED_TEXT_EDITORS = {
  text: 'text',
  expandable: 'expandable',
};

export const WysiwygEditor = ({
  initialValue, editorType, onChange, minHeight,
}) => {
  const { editorRef, refReady, setEditorRef } = prepareEditorRef();
  const { courseId } = useSelector((state) => state.courseDetail);
  const isEquivalentCodeExtraSpaces = (first, second) => {
    // Utils allows to compare code extra spaces
    const removeWhitespace = (str) => str.replace(/\s/g, '');
    return removeWhitespace(first) === removeWhitespace(second);
  };

  const isEquivalentCodeQuotes = (first, second) => {
    // Utils allows to compare code with single quotes and double quotes
    const normalizeQuotes = (section) => section.replace(/'/g, '"');
    return normalizeQuotes(first) === normalizeQuotes(second);
  };

  // default initial string returned onEditorChange if empty input
  const needToChange = (value) => !isEquivalentCodeQuotes(initialValue, value)
    && !isEquivalentCodeExtraSpaces(initialValue, value)
    && (initialValue !== DEFAULT_EMPTY_WYSIWYG_VALUE || value !== '');

  const handleUpdate = (value, editor) => {
    // With bookmarks keep the current cursor position at the end of the line
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
    <TinyMceWidget
      textValue={initialValue}
      editorRef={editorRef}
      editorType={editorType}
      initialValue={initialValue}
      minHeight={minHeight}
      editorContentHtml={initialValue}
      setEditorRef={setEditorRef}
      onChange={handleUpdate}
      initializeEditor={() => ({})}
      learningContextId={courseId}
      images={{}}
      enableImageUpload={false}
      onEditorChange={() => ({})}
    />
  );
};

WysiwygEditor.defaultProps = {
  initialValue: '',
  editorType: SUPPORTED_TEXT_EDITORS.text,
  minHeight: 200,
};

WysiwygEditor.propTypes = {
  initialValue: PropTypes.string,
  editorType: PropTypes.oneOf(Object.values(SUPPORTED_TEXT_EDITORS)),
  onChange: PropTypes.func.isRequired,
  minHeight: PropTypes.number,
};
