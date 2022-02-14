import React, { useContext } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  useToggle, Spinner, Toast,
} from '@edx/paragon';
import EditorPageContext from '../EditorPageContext';
import { ActionStates } from '../data/constants';
import ImageUploadModal from './ImageUpload/Wizard/ImageUploadModal';

import 'tinymce';
import 'tinymce/themes/silver';
import 'tinymce/skins/ui/oxide/skin.css';
import 'tinymce/icons/default';
import 'tinymce/plugins/link';
import 'tinymce/plugins/table';
import 'tinymce/plugins/codesample';
import 'tinymce/plugins/emoticons';
import 'tinymce/plugins/emoticons/js/emojis';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/code';
import 'tinymce/plugins/autoresize';

const TextEditor = () => {
  const {
    blockValue, blockError, blockLoading, editorRef,
  } = useContext(EditorPageContext);

  const [isImageUploadModalOpen, openUploadModal, closeUploadModal] = useToggle(false);

  return (
    <div className="editor-body h-75">
      <ImageUploadModal isOpen={isImageUploadModalOpen} close={closeUploadModal} />
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
            onInit={(evt, editor) => {
              editorRef.current = editor;
            }}
            initialValue={blockValue ? blockValue.data.data : ''}
            init={{
              setup: (editor) => {
                editor.ui.registry.addButton('imageuploadbutton', {
                  icon: 'image',
                  onAction: () => openUploadModal(),
                });
              },
              plugins: 'link codesample emoticons table charmap code autoresize',
              menubar: false,
              toolbar: 'undo redo | formatselect | '
            + 'bold italic backcolor | alignleft aligncenter '
            + 'alignright alignjustify | bullist numlist outdent indent |'
            + 'imageuploadbutton | link | emoticons | table | codesample | charmap |'
            + 'removeformat | hr |code',
              height: '100%',
              content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
              min_height: 1000,
              branding: false,
            }}
          />
        )}
    </div>
  );
};

export default TextEditor;
