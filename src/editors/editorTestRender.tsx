import React from 'react';
import { Provider } from 'react-redux';
import { type Store } from 'redux';
import { render as baseRender, type RouteOptions } from '../testUtils';
import { EditorContextProvider } from './EditorContext';
import { createStore } from './data/store';
import { EditorState } from './data/redux';

/**
 * Partial<EditorState> only allows top-level keys to be missing. This is an
 * even more partial state that allows sub-keys to be missing.
 */
export type PartialEditorState = {
  [P in keyof EditorState]?: Partial<EditorState[P]> | undefined;
};

interface Options {
  learningContextId?: string;
  initialState?: PartialEditorState;
}

let editorStore: Store<EditorState>;

/**
 * Custom render function for testing React components with the editor context and Redux store.
 *
 * Wraps the provided UI in both the EditorContextProvider and Redux Provider,
 * ensuring that components under test have access to the necessary context and store.
 *
 * @param {React.ReactElement} ui - The React element to render.
 * @param options - Options
 * @returns {RenderResult} The result of the render, as returned by RTL render.
 */
const editorRender = (ui, {
  learningContextId = 'course-v1:Org+COURSE+RUN',
  initialState = undefined,
  ...routerOptions
}: Options & RouteOptions = {}) => {
  editorStore = createStore(initialState);
  return baseRender(ui, {
    extraWrapper: ({ children }) => (
      <EditorContextProvider learningContextId={learningContextId}>
        <Provider store={editorStore}>
          {children}
        </Provider>
      </EditorContextProvider>
    ),
    ...routerOptions,
  });
};

export function getEditorStore() {
  return editorStore;
}

export default editorRender;
