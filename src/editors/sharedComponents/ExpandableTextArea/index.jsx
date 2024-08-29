import React from 'react';
import PropTypes from 'prop-types';
import TinyMceWidget from '../TinyMceWidget';
import { prepareEditorRef } from '../TinyMceWidget/hooks';
import './index.scss';

const ExpandableTextArea = ({
  value,
  setContent,
  error,
  errorMessage,
  ...props
}) => {
  const { editorRef, setEditorRef } = prepareEditorRef();

  return (
    <>
      <div className="expandable-mce error">
        <TinyMceWidget
          editorContentHtml={value}
          editorRef={editorRef}
          editorType="expandable"
          setEditorRef={setEditorRef}
          updateContent={setContent}
          {...props}
        />
      </div>
      {error && (
        <div className="text-danger-500 x-small">
          {props.errorMessage}
        </div>
      )}
    </>
  );
};

ExpandableTextArea.defaultProps = {
  value: null,
  placeholder: null,
  error: false,
  errorMessage: null,
};

ExpandableTextArea.propTypes = {
  value: PropTypes.string,
  setContent: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  error: PropTypes.bool,
  errorMessage: PropTypes.string,
};

export default ExpandableTextArea;
