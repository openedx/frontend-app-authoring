import { useState } from 'react';
import * as module from './hooks';
import { StrictDict } from '../../utils/index';

export const openModalWithSelectedImage = (editor, setImage, openModal) => () => {
  const imgHTML = editor.selection.getNode();
  setImage({
    externalUrl: imgHTML.src,
    altText: imgHTML.alt,
    width: imgHTML.width,
    height: imgHTML.height,
  });
  openModal();
};

export const addImageUploadBehavior = ({ openModal, setImage }) => (editor) => {
  editor.ui.registry.addButton('imageuploadbutton', {
    icon: 'image',
    onAction: openModal,
  });
  editor.ui.registry.addButton('editimagesettings', {
    icon: 'image',
    onAction: module.openModalWithSelectedImage(editor, setImage, openModal),
  });
};

export const initializeEditorRef = (setRef, initializeEditor) => (editor) => {
  setRef(editor);
  initializeEditor();
};

// for toast onClose to avoid console warnings
export const nullMethod = () => {};

export const pluginConfig = {
  plugins: StrictDict({
    link: 'link',
    codesample: 'codesample',
    emoticons: 'emoticons',
    table: 'table',
    charmap: 'charmap',
    code: 'code',
    autoresize: 'autoresize',
    image: 'image',
    imagetools: 'imagetools',
  }),
  menubar: false,
  toolbar: StrictDict({
    do: 'undo redo',
    formatselect: 'formatselect',
    wieght: 'bold italic backcolor',
    align: 'alignleft aligncenter alignright alignjustify',
    indents: 'bullist numlist outdent indent ',
    imageupload: 'imageuploadbutton',
    link: 'link',
    emoticons: 'emoticons',
    table: 'table',
    codesample: 'codesample',
    charmap: 'charmap',
    removeformat: 'removeformat',
    hr: 'hr',
    code: 'code',
  }),
  imageToolbar: StrictDict({
    rotate: 'rotateleft rotateright',
    flip: 'flipv fliph',
    editImageSettings: 'editimagesettings',
  }),
};
export const getConfig = (key) => {
  if (key === 'imageToolbar' || key === 'toolbar') {
    return Object.values(module.pluginConfig[key]).join(' | ');
  }
  return Object.values(module.pluginConfig[key]).join(' ');
};

export const editorConfig = ({
  setEditorRef,
  blockValue,
  openModal,
  initializeEditor,
  setSelection,
}) => ({
  onInit: (evt, editor) => module.initializeEditorRef(setEditorRef, initializeEditor)(editor),
  initialValue: blockValue ? blockValue.data.data : '',
  init: {
    setup: module.addImageUploadBehavior({ openModal, setImage: setSelection }),
    plugins: module.getConfig('plugins'),
    menubar: false,
    toolbar: module.getConfig('toolbar'),
    imagetools_toolbar: module.getConfig('imageToolbar'),
    imagetools_cors_hosts: ['courses.edx.org'],
    height: '100%',
    min_height: 1000,
    branding: false,
  },
});

export const selectedImage = (val) => useState(val);

export const modalToggle = () => {
  const [isOpen, setIsOpen] = useState(false);
  return {
    isOpen,
    openModal: () => setIsOpen(true),
    closeModal: () => setIsOpen(false),
  };
};
