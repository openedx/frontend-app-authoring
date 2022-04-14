import {
  useRef, useEffect, useCallback, useState,
} from 'react';

import { StrictDict } from '../../utils';
import tinyMCE from '../../data/constants/tinyMCE';
import pluginConfig from './pluginConfig';
import * as appHooks from '../../hooks';
import * as module from './hooks';

export const { nullMethod, navigateCallback, navigateTo } = appHooks;

export const state = StrictDict({
  isModalOpen: (val) => useState(val),
  imageSelection: (val) => useState(val),
  refReady: (val) => useState(val),
});

export const addImageUploadBehavior = ({ openModal, setImage }) => (editor) => {
  editor.ui.registry.addButton(tinyMCE.buttons.imageUploadButton, {
    icon: 'image',
    onAction: openModal,
  });
  editor.ui.registry.addButton(tinyMCE.buttons.editImageSettings, {
    icon: 'image',
    onAction: module.openModalWithSelectedImage({ editor, setImage, openModal }),
  });
};

export const editorConfig = ({
  setEditorRef,
  blockValue,
  openModal,
  initializeEditor,
  setSelection,
}) => ({
  onInit: (evt, editor) => {
    setEditorRef(editor);
    initializeEditor();
  },
  initialValue: blockValue ? blockValue.data.data : '',
  init: {
    setup: module.addImageUploadBehavior({ openModal, setImage: setSelection }),
    plugins: pluginConfig.plugins,
    imagetools_toolbar: pluginConfig.imageToolbar,
    toolbar: pluginConfig.toolbar,
    contextmenu: 'link table',
    ...pluginConfig.config,
  },
});

export const modalToggle = () => {
  const [isOpen, setIsOpen] = module.state.isModalOpen(false);
  return {
    isOpen,
    openModal: () => setIsOpen(true),
    closeModal: () => setIsOpen(false),
  };
};

export const openModalWithSelectedImage = ({ editor, setImage, openModal }) => () => {
  const imgHTML = editor.selection.getNode();
  setImage({
    externalUrl: imgHTML.src,
    altText: imgHTML.alt,
    width: imgHTML.width,
    height: imgHTML.height,
  });
  openModal();
};

export const prepareEditorRef = () => {
  const editorRef = useRef(null);
  const setEditorRef = useCallback((ref) => {
    editorRef.current = ref;
  }, []);
  const [refReady, setRefReady] = module.state.refReady(false);
  useEffect(() => setRefReady(true), []);
  return { editorRef, refReady, setEditorRef };
};

export const getContent = ({ editorRef }) => () => editorRef.current?.getContent();

export const selectedImage = (val) => {
  const [selection, setSelection] = module.state.imageSelection(val);
  return {
    clearSelection: () => setSelection(null),
    selection,
    setSelection,
  };
};
