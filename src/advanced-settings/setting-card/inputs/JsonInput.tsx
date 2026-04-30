import { useEffect, useRef } from 'react';
import { minimalSetup, EditorView } from 'codemirror';
import { EditorState, Annotation } from '@codemirror/state';
import { json } from '@codemirror/lang-json';

// Marks a dispatch as programmatic so the updateListener ignores it
const programmaticUpdate = Annotation.define<boolean>();

const jsonEditorTheme = EditorView.theme({
  '&': { fontSize: '0.875rem', borderRadius: '0.375rem', border: '1px solid #ced4da' },
  '.cm-editor': { borderRadius: '0.375rem' },
  '.cm-focused': { outline: 'none' },
  '.cm-scroller': { fontFamily: 'monospace', minHeight: '5rem' },
});

interface JsonInputProps {
  initialValue: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  isEditableState: boolean;
}

const JsonInput = ({
  initialValue,
  onChange,
  onBlur,
  isEditableState,
}: JsonInputProps) => {
  const divRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onBlurRef = useRef(onBlur);

  // Keep refs pointing to the latest callbacks so the CodeMirror
  // event handlers (created once on mount) always call the current versions.
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  useEffect(() => {
    onBlurRef.current = onBlur;
  }, [onBlur]);

  useEffect(() => {
    if (!divRef.current) { return undefined; }

    const state = EditorState.create({
      doc: initialValue,
      extensions: [
        minimalSetup,
        json(),
        jsonEditorTheme,
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !update.transactions.some((tr) => tr.annotation(programmaticUpdate))) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
        EditorView.domEventHandlers({
          blur: () => onBlurRef.current(),
        }),
      ],
    });

    viewRef.current = new EditorView({ state, parent: divRef.current });

    return () => {
      viewRef.current?.destroy();
      viewRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset editor content when edits are cancelled or saved
  useEffect(() => {
    if (!isEditableState && viewRef.current) {
      const current = viewRef.current.state.doc.toString();
      if (current !== initialValue) {
        viewRef.current.dispatch({
          changes: { from: 0, to: viewRef.current.state.doc.length, insert: initialValue },
          annotations: programmaticUpdate.of(true),
        });
      }
    }
  }, [isEditableState, initialValue]);

  return <div ref={divRef} className="setting-json-editor" />;
};

export default JsonInput;
