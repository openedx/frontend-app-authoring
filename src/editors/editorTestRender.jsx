import React from 'react';
import { Provider } from 'react-redux';
import { render as baseRender } from '../testUtils';
import { EditorContextProvider } from './EditorContext';
import { initializeStore } from './data/redux'; // adjust path if needed

/**
 * Custom render function for testing React components with the editor context and Redux store.
 *
 * Wraps the provided UI in both the EditorContextProvider and Redux Provider,
 * ensuring that components under test have access to the necessary context and store.
 *
 * @param {React.ReactElement} ui - The React element to render.
 * @param {object} [options] - Optional parameters.
 * @param {object} [options.initialState] - Optional initial state for the store.
 * @param {string} [options.learningContextId] - Optional learning context ID.
 * @returns {RenderResult} The result of the render, as returned by RTL render.
 */
const editorRender = (
  ui,
  {
    initialState = {},
    learningContextId = 'course-v1:Org+COURSE+RUN',
  } = {},
) => {
  const store = initializeStore(initialState);

  return baseRender(ui, {
    extraWrapper: ({ children }) => (
      <EditorContextProvider learningContextId={learningContextId}>
        <Provider store={store}>
          {children}
        </Provider>
      </EditorContextProvider>
    ),
  });
};

export default editorRender;
