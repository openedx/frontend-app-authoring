import * as appHooks from '../../hooks';
import { setAssetToStaticUrl } from '../../sharedComponents/TinyMceWidget/hooks';

export const { nullMethod, navigateCallback, navigateTo } = appHooks;

export const getContent = ({ editorRef, showRawEditor }) => () => {
  const content = (showRawEditor && editorRef && editorRef.current
    ? editorRef.current.state.doc.toString()
    : editorRef.current?.getContent());
  return setAssetToStaticUrl({ editorValue: content });
};
