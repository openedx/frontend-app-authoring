import {
  useRef, useCallback, useState, useEffect,
} from 'react';
import tinyMCEStyles from '../../data/constants/tinyMCEStyles';
import { StrictDict } from '../../utils';
import * as module from './hooks';

export const state = StrictDict({
  refReady: (val) => useState(val),
});

export const problemEditorConfig = ({
  setEditorRef,
  editorRef,
  question,
  updateQuestion,
}) => ({
  onInit: (evt, editor) => {
    setEditorRef(editor);
  },
  initialValue: question || '',
  init: {
    skin: false,
    content_css: false,
    content_style: tinyMCEStyles,
    menubar: false,
    branding: false,
    min_height: 150,
  },
  onFocusOut: () => {
    const content = editorRef.current.getContent();
    updateQuestion(content);
  },
});

export const prepareEditorRef = () => {
  const editorRef = useRef(null);
  const setEditorRef = useCallback((ref) => {
    editorRef.current = ref;
  }, []);
  const [refReady, setRefReady] = module.state.refReady(false);
  useEffect(() => setRefReady(true), [setRefReady]);
  return { editorRef, refReady, setEditorRef };
};
