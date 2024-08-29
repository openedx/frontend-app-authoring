import { useRef } from 'react';
// This 'module' self-import hack enables mocking during tests.
// See src/editors/decisions/0005-internal-editor-testability-decisions.md. The whole approach to how hooks are tested
// should be re-thought and cleaned up to avoid this pattern.
// eslint-disable-next-line import/no-self-import
import * as module from './hooks';

export const getSaveBtnProps = ({ editorRef, ref, close }) => ({
  onClick: () => {
    if (editorRef && editorRef.current && ref && ref.current) {
      const content = ref.current.state.doc.toString();
      editorRef.current.setContent(content);
      close();
    }
  },
});

export const prepareSourceCodeModal = ({ editorRef, close }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const ref = useRef();
  const saveBtnProps = module.getSaveBtnProps({ editorRef, ref, close });

  if (editorRef && editorRef.current && typeof editorRef.current.getContent === 'function') {
    const value = editorRef?.current?.getContent();
    return { saveBtnProps, value, ref };
  }
  return { saveBtnProps, value: null, ref };
};
