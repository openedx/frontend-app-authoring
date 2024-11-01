import * as appHooks from '../../hooks';
import { setAssetToStaticUrl } from '../../sharedComponents/TinyMceWidget/hooks';

export const { nullMethod, navigateCallback, navigateTo } = appHooks;

export const getContent = ({ editorRef, showRawEditor }) => () => {
  const content = (showRawEditor && editorRef && editorRef.current
    ? editorRef.current.state.doc.toString()
    : editorRef.current?.getContent());
  return setAssetToStaticUrl({ editorValue: content });
};

export const isDirty = ({ editorRef, showRawEditor }) => () => {
  /* istanbul ignore next */
  if (!editorRef?.current) {
    return false;
  }
  const dirty = (showRawEditor && editorRef && editorRef.current
    ? editorRef.current.observer?.lastChange !== 0
    : !editorRef.current.isNotDirty);
  return dirty;
};
