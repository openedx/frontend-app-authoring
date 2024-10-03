import React from 'react';

/**
 * Shared context that's used by all our editors.
 *
 * Note: we're in the process of moving things from redux into this.
 */
export interface EditorContext {
  learningContextId: string;
  /**
   * When editing components in the libraries part of the Authoring MFE, we show
   * the editors in a modal (fullScreen = false). This is the preferred approach
   * so that authors can see context behind the modal.
   * However, when making edits from the legacy course view, we display the
   * editors in a fullscreen view. This approach is deprecated.
   */
  fullScreen: boolean;
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
  fullScreen: boolean;
}> = ({ children, ...contextData }) => {
  const ctx: EditorContext = React.useMemo(() => ({ ...contextData }), []);
  return <context.Provider value={ctx}>{children}</context.Provider>;
};
