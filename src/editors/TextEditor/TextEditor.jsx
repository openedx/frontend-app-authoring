import React, { useContext } from 'react';
import { Spinner, Toast } from '@edx/paragon';
import { Editor } from '@tinymce/tinymce-react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import EditorPageContext from '../EditorPageContext';
import { ActionStates } from '../data/constants';

const TextEditor = () => {
  const {
    blockValue, blockError, blockLoading, editorRef,
  } = useContext(EditorPageContext);

  return (
    <div className="editor-body h-75">
      <Toast show={blockError != null} onClose={() => {}}>
        <FormattedMessage
          id="authoring.texteditor.load.error"
          defaultMessage="Error: Could Not Load Text Content"
          description="Error Message Dispayed When HTML content fails to Load"
        />
      </Toast>
      {blockLoading !== ActionStates.FINISHED
        ? (
          <div className="text-center p-6">
            <Spinner animation="border" className="m-3" screenreadertext="loading" />
          </div>
        )
        : (
          <Editor
            onInit={(evt, editor) => { editorRef.current = editor; }}
            initialValue={blockValue ? blockValue.data.data : ''}
            init={{
              height: '100%',
              menubar: false,
              plugins: [
                'advlist autolink lists link image charmap print preview anchor',
                'searchreplace visual blocks code fullscreen',
                'insertdatetime media table paste code help wordcount',
                'autoresize',
              ],
              toolbar: 'undo redo | formatselect | '
            + 'bold italic backcolor | alignleft aligncenter '
            + 'alignright alignjustify | bullist numlist outdent indent | '
            + 'removeformat | help',
              content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
              max_height: 900,
              min_height: 700,
              branding: false,
            }}
          />
        )}
    </div>
  );
};

export default TextEditor;
