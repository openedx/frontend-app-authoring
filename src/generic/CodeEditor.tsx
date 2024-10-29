import React from 'react';
import { basicSetup, EditorView } from 'codemirror';
import { EditorState, Compartment } from '@codemirror/state';
import { xml } from '@codemirror/lang-xml';

export type EditorAccessor = EditorView;

interface Props {
  readOnly?: boolean;
  children?: string;
  editorRef?: React.MutableRefObject<EditorAccessor | undefined>;
}

export const CodeEditor: React.FC<Props> = ({
  readOnly = false,
  children = '',
  editorRef,
}) => {
  const divRef = React.useRef<HTMLDivElement>(null);
  const language = React.useMemo(() => new Compartment(), []);
  const tabSize = React.useMemo(() => new Compartment(), []);

  React.useEffect(() => {
    if (!divRef.current) { return; }
    const state = EditorState.create({
      doc: children,
      extensions: [
        basicSetup,
        language.of(xml()),
        tabSize.of(EditorState.tabSize.of(2)),
        EditorState.readOnly.of(readOnly),
      ],
    });

    const view = new EditorView({
      state,
      parent: divRef.current,
    });
    if (editorRef) {
      // eslint-disable-next-line no-param-reassign
      editorRef.current = view;
    }
    // eslint-disable-next-line consistent-return
    return () => {
      if (editorRef) {
        // eslint-disable-next-line no-param-reassign
        editorRef.current = undefined;
      }
      view.destroy(); // Clean up
    };
  }, [divRef.current, readOnly, editorRef]);

  return <div ref={divRef} />;
};
