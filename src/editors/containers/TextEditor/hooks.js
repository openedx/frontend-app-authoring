import {
  useRef, useEffect, useCallback, useState,
} from 'react';

import { StrictDict } from '../../utils';
import tinyMCE from '../../data/constants/tinyMCE';
import tinyMCEStyles from '../../data/constants/tinyMCEStyles';
import pluginConfig from './pluginConfig';
import * as appHooks from '../../hooks';
import * as module from './hooks';

export const { nullMethod, navigateCallback, navigateTo } = appHooks;

export const state = StrictDict({
  isModalOpen: (val) => useState(val),
  imageSelection: (val) => useState(val),
  refReady: (val) => useState(val),
});

export const setupCustomBehavior = ({ openModal, setImage }) => (editor) => {
  // image upload button
  editor.ui.registry.addButton(tinyMCE.buttons.imageUploadButton, {
    icon: 'image',
    tooltip: 'Add Image',
    onAction: openModal,
  });
  // editing an existing image
  editor.ui.registry.addButton(tinyMCE.buttons.editImageSettings, {
    icon: 'image',
    tooltip: 'Edit Image Settings',
    onAction: module.openModalWithSelectedImage({ editor, setImage, openModal }),
  });
  // overriding the code plugin's icon with 'HTML' text
  const openCodeEditor = () => editor.execCommand('mceCodeEditor');
  editor.ui.registry.addButton(tinyMCE.buttons.code, {
    text: 'HTML',
    tooltip: 'Source code',
    onAction: openCodeEditor,
  });
  // add a custom simple inline code block formatter.
  const setupCodeFormatting = (api) => {
    editor.formatter.formatChanged(
      'code',
      (active) => api.setActive(active),
    );
  };
  const toggleCodeFormatting = () => {
    editor.formatter.toggle('code');
    editor.undoManager.add();
    editor.focus();
  };
  editor.ui.registry.addToggleButton(tinyMCE.buttons.codeBlock, {
    icon: 'sourcecode',
    tooltip: 'Code Block',
    onAction: toggleCodeFormatting,
    onSetup: setupCodeFormatting,
  });
};

// imagetools_cors_hosts needs a protocol-sanatized url
export const removeProtocolFromUrl = (url) => url.replace(/^https?:\/\//, '');

export const editorConfig = ({
  blockValue,
  initializeEditor,
  lmsEndpointUrl,
  openModal,
  setEditorRef,
  setSelection,
  studioEndpointUrl,
}) => ({
  onInit: (evt, editor) => {
    setEditorRef(editor);
    initializeEditor();
  },
  initialValue: blockValue ? blockValue.data.data : '',
  init: {
    ...pluginConfig.config,
    skin: false,
    content_css: false,
    content_style: tinyMCEStyles,
    contextmenu: 'link table',
    document_base_url: lmsEndpointUrl,
    imagetools_cors_hosts: [removeProtocolFromUrl(lmsEndpointUrl), removeProtocolFromUrl(studioEndpointUrl)],
    imagetools_toolbar: pluginConfig.imageToolbar,
    plugins: pluginConfig.plugins,
    setup: module.setupCustomBehavior({ openModal, setImage: setSelection }),
    toolbar: pluginConfig.toolbar,
    valid_children: '+body[style]',
    valid_elements: '*[*]',
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

export const getContent = ({ editorRef, isRaw }) => () => {
  if (isRaw && editorRef && editorRef.current) {
    return editorRef.current.value;
  }
  return editorRef.current?.getContent();
};

export const selectedImage = (val) => {
  const [selection, setSelection] = module.state.imageSelection(val);
  return {
    clearSelection: () => setSelection(null),
    selection,
    setSelection,
  };
};
