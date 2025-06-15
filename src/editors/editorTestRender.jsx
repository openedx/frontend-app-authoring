import React from 'react';
import { Provider } from 'react-redux';
import { render as baseRender } from '../testUtils';
import { EditorContextProvider } from './EditorContext';
import editorStore from './data/store';

/**
 * Custom render function for testing React components with the editor context and Redux store.
 *
 * Wraps the provided UI in both the EditorContextProvider and Redux Provider,
 * ensuring that components under test have access to the necessary context and store.
 *
 * @param {React.ReactElement} ui - The React element to render.
 * @param {string} [learningContextId='course-v1:Org+COURSE+RUN'] - Optional learning context ID
 * for the EditorContextProvider.
 * @returns {RenderResult} The result of the render, as returned by RTL render.
 */
const editorRender = (ui, learningContextId = 'course-v1:Org+COURSE+RUN') => baseRender(ui, {
  extraWrapper: ({ children }) => (
    <EditorContextProvider learningContextId={learningContextId}>
      <Provider store={editorStore}>
        {children}
      </Provider>
    </EditorContextProvider>
  ),
});

export default editorRender;
