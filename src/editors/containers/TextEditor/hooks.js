import {
  useRef, useEffect, useCallback, useState,
} from 'react';

import { StrictDict } from '../../utils';
import * as appHooks from '../../hooks';
import * as module from './hooks';
import { setAssetToStaticUrl } from '../../sharedComponents/TinyMceWidget/hooks';

export const { nullMethod, navigateCallback, navigateTo } = appHooks;

export const state = StrictDict({
  refReady: (val) => useState(val),
});

export const prepareEditorRef = () => {
  const editorRef = useRef(null);
  const setEditorRef = useCallback((ref) => {
    editorRef.current = ref;
  }, []);
  const [refReady, setRefReady] = module.state.refReady(false);
  useEffect(() => setRefReady(true), []);
  return { editorRef, refReady, setEditorRef };
};

export const getContent = ({ editorRef, isRaw, assets }) => () => {
  const content = (isRaw && editorRef && editorRef.current
    ? editorRef.current.state.doc.toString()
    : editorRef.current?.getContent());
  return setAssetToStaticUrl({ editorValue: content, assets });
};
