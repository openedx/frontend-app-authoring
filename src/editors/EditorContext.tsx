import React from 'react';

/**
 * Shared context that's used by all our editors.
 *
 * Note: we're in the process of moving things from redux into this.
 */
export interface EditorContext {
  learningContextId: string;
}

const context = React.createContext<EditorContext | undefined>(undefined);

/** Hook to get the editor context (shared context) */
export function useEditorContext() {
  const ctx = React.useContext(context);
  if (ctx === undefined) {
    /* istanbul ignore next */
    throw new Error('This component needs to be wrapped in <EditorContextProvider>');
  }
  return ctx;
}

export const EditorContextProvider: React.FC<{
  children: React.ReactNode,
  learningContextId: string;
}> = ({ children, ...contextData }) => {
  const ctx: EditorContext = React.useMemo(() => ({ ...contextData }), []);
  return <context.Provider value={ctx}>{children}</context.Provider>;
};
