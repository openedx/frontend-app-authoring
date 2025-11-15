import React from 'react';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import { render as baseRender, RouteOptions, WrapperOptions } from '../testUtils';
import { EditorContextProvider } from './EditorContext';
import { createStore } from './data/store';
import { type EditorState } from './data/redux'; // adjust path if needed

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

export type PartialEditorState = RecursivePartial<EditorState>;

let editorStore: Store<EditorState>;

/**
 * Custom render function for testing React components with the editor context and Redux store.
 *
 * Wraps the provided UI in both the EditorContextProvider and Redux Provider,
 * ensuring that components under test have access to the necessary context and store.
 *
 */
export const editorRender = (
  ui: React.ReactElement,
  {
    initialState = {},
    learningContextId = 'course-v1:Org+COURSE+RUN',
    ...options
  }: WrapperOptions & RouteOptions & { initialState?: PartialEditorState, learningContextId?: string } = {},
) => {
  // We might need a way for the test cases to access this store directly. In that case we could allow either an
  // initialState parameter OR an editorStore parameter.
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
