import React from 'react';
import { Provider } from 'react-redux';
import { render as baseRender } from '../testUtils';
import { EditorContextProvider } from './EditorContext';
import editorStore from './data/store';

const render = (ui, learningContextId = 'course-v1:Org+COURSE+RUN') => baseRender(ui, {
  extraWrapper: ({ children }) => (
    <EditorContextProvider learningContextId={learningContextId}>
      <Provider store={editorStore}>
        {children}
      </Provider>
    </EditorContextProvider>
  ),
});

export default render;
