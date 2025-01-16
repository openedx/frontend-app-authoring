import React from 'react';
import TinyMceWidget from '../TinyMceWidget';
import { prepareEditorRef } from '../TinyMceWidget/hooks';
import './index.scss';

interface Props extends Partial<React.ComponentProps<typeof TinyMceWidget>> {
  setContent: (content: string) => void;
  value?: string | null;
  placeholder?: string;
  error?: boolean;
  errorMessage?: string;
}

export const ExpandableTextArea = ({
  value = null, // TODO: why not default to '' ?
  setContent,
  error = false,
  errorMessage = '',
  ...props
}: Props) => {
  const { editorRef, setEditorRef } = prepareEditorRef();

  return (
    <>
      <div className="expandable-mce error">
        {/* @ts-ignore TODO: Remove this 'ts-ignore' once TinyMceWidget is converted to TypeScript */}
        <TinyMceWidget
          {...props}
          editorContentHtml={value}
          editorRef={editorRef}
          editorType="expandable"
          setEditorRef={setEditorRef}
          updateContent={setContent}
        />
      </div>
      {error && (
        <div className="text-danger-500 x-small">
          {errorMessage}
        </div>
      )}
    </>
  );
};

export default ExpandableTextArea;
