import React from 'react';
import { Provider } from 'react-redux';
import { render as baseRender, WrapperOptions } from '../testUtils';
import { EditorContextProvider } from './EditorContext';
import { initializeStore, type PartialEditorState } from './data/redux'; // adjust path if needed

/**
 * Custom render function for testing React components with the editor context and Redux store.
 *
 * Wraps the provided UI in both the EditorContextProvider and Redux Provider,
 * ensuring that components under test have access to the necessary context and store.
 */
export const editorRender = (
  ui: React.ReactElement,
  {
    initialState = {},
    learningContextId = 'course-v1:Org+COURSE+RUN',
    ...options
  }: Omit<WrapperOptions, 'extraWrapper'> & { initialState?: PartialEditorState; learningContextId?: string; } = {},
) => {
  // We might need a way for the test cases to access this store directly. In that case we could allow either an
  // initialState parameter OR an editorStore parameter.
  const store = initializeStore(initialState);

  return baseRender(ui, {
    ...options,
    extraWrapper: ({ children }) => (
      <EditorContextProvider learningContextId={learningContextId}>
        <Provider store={store}>
          {children}
        </Provider>
      </EditorContextProvider>
    ),
  });
};
