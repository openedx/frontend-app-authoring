import { useRef } from 'react';
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
  const ref = useRef();
  const saveBtnProps = module.getSaveBtnProps({ editorRef, ref, close });

  if (editorRef && editorRef.current && typeof editorRef.current.getContent === 'function') {
    const value = editorRef?.current?.getContent();
    return { saveBtnProps, value, ref };
  }
  return { saveBtnProps, value: null, ref };
};

export default {
  prepareSourceCodeModal,
};
