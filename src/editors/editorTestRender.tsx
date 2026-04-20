import React from 'react';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import { render as baseRender, RouteOptions, WrapperOptions } from '../testUtils';
import { EditorContextProvider } from './EditorContext';
import { type PartialEditorState } from './data/redux';
import { createStore } from './data/store';
import { type EditorState } from './data/redux';

// Tests use this store, while non-test code uses the store in `@src/editors/data/store.ts`, but they have the same
// type.
let editorStore: Store<EditorState>;

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
  }:
    & Omit<WrapperOptions, 'extraWrapper'>
    & RouteOptions
    & { initialState?: PartialEditorState; learningContextId?: string; } = {},
) => {
  editorStore = createStore(initialState);

  return baseRender(ui, {
    ...options,
    extraWrapper: ({ children }) => (
      <EditorContextProvider learningContextId={learningContextId}>
        <Provider store={editorStore}>
          {children}
        </Provider>
      </EditorContextProvider>
    ),
  });
};

export function getEditorStore() {
  return editorStore;
}
