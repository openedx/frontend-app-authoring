import * as appHooks from '../../hooks';
import { setAssetToStaticUrl } from '../../sharedComponents/TinyMceWidget/hooks';

export const { nullMethod, navigateCallback, navigateTo } = appHooks;

/**
 * Returns the content of the editor, as a function of the editor's state.
 * @param {Object} editorRef - the editor's ref
 * @param {boolean} showRawEditor - whether to show the raw editor
 * @param {boolean} includeTheme - whether to include the theme
 * @returns {function} the content of the editor
 */
export const getContent = ({ editorRef, showRawEditor, includeTheme }) => () => {
  const content = showRawEditor && editorRef && editorRef.current
    ? editorRef.current.state.doc.toString()
    : editorRef.current?.getContent();
  return {
    // `data` is sent as the block's `data` field, which the block API only
    // accepts as a string. Everything else is settings-scoped and travels in
    // `metadata` (see apiMethods.normalizeContent).
    data: setAssetToStaticUrl({ editorValue: content }),
    include_theme: includeTheme,
  };
};

export const isDirty = ({ editorRef, showRawEditor, includeTheme, initialIncludeTheme }) => () => {
  // Compare against the value the block was loaded with
  if (includeTheme !== initialIncludeTheme) {
    return true;
  }
  /* istanbul ignore next */
  if (!editorRef?.current) {
    return false;
  }
  const dirty = showRawEditor && editorRef && editorRef.current
    ? editorRef.current.observer?.lastChange !== 0
    : !editorRef.current.isNotDirty;
  return dirty;
};
