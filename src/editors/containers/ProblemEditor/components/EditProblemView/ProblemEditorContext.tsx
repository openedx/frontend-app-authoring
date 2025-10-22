import React from 'react';

type ProblemEditorRef = React.MutableRefObject<unknown> | React.RefObject<unknown> | null;

export interface ProblemEditorContextValue {
  editorRef: ProblemEditorRef;
}

export type ProblemEditorContextInit = {
  editorRef?: ProblemEditorRef;
};

const context = React.createContext<ProblemEditorContextValue | undefined>(undefined);

export function useProblemEditorContext() {
  const ctx = React.useContext(context);
  if (ctx === undefined) {
    /* istanbul ignore next */
    throw new Error('This component needs to be wrapped in <ProblemEditorContextProvider>');
  }
  return ctx;
}

export const ProblemEditorContextProvider: React.FC<{ children: React.ReactNode; } & ProblemEditorContextInit> = ({
  children,
  editorRef = null,
}) => {
  const ctx: ProblemEditorContextValue = React.useMemo(() => ({ editorRef }), [editorRef]);

  return <context.Provider value={ctx}>{children}</context.Provider>;
};
