import { useState } from 'react';
import * as module from './hooks';

export const addImageUploadButton = (openModal) => (editor) => {
  editor.ui.registry.addButton('imageuploadbutton', {
    icon: 'image',
    onAction: openModal,
  });
};

export const initializeEditorRef = (setRef) => (evt, editor) => { setRef(editor); };

// for toast onClose to avoid console warnings
export const nullMethod = () => {};

export const editorConfig = ({
  setEditorRef,
  blockValue,
  openModal,
  initializeEditor,
}) => ({
  onInit: () => {
    module.initializeEditorRef(setEditorRef);
    initializeEditor();
  },
  initialValue: blockValue ? blockValue.data.data : '',
  init: {
    setup: module.addImageUploadButton(openModal),
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
  },
});

export const modalToggle = () => {
  const [isOpen, setIsOpen] = useState(false);
  return {
    isOpen,
    openModal: () => setIsOpen(true),
    closeModal: () => setIsOpen(false),
  };
};
