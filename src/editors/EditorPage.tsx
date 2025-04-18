import React from 'react';
import { Provider } from 'react-redux';

import store from './data/store';
import Editor from './Editor';
import ErrorBoundary from './sharedComponents/ErrorBoundary';
import { EditorComponent } from './EditorComponent';
import { EditorContextProvider } from './EditorContext';

interface Props extends EditorComponent {
  blockId?: string;
  blockType: string;
  courseId: string;
  isMarkdownEditorEnabledForCourse?: boolean;
  lmsEndpointUrl?: string;
  studioEndpointUrl?: string;
  children?: never;
}

/**
 * Wraps the editors with the redux state provider.
 * TODO: refactor some of this to be React Context and React Query
 */
const EditorPage: React.FC<Props> = ({
  courseId,
  blockType,
  blockId = null,
  isMarkdownEditorEnabledForCourse = false,
  lmsEndpointUrl = null,
  studioEndpointUrl = null,
  onClose = null,
  returnFunction = null,
}) => (
  <Provider store={store}>
    <ErrorBoundary
      {...{
        learningContextId: courseId,
        studioEndpointUrl,
      }}
    >
      <EditorContextProvider learningContextId={courseId}>
        <Editor
          {...{
            onClose,
            learningContextId: courseId,
            blockType,
            blockId,
            isMarkdownEditorEnabledForCourse,
            lmsEndpointUrl,
            studioEndpointUrl,
            returnFunction,
          }}
        />
      </EditorContextProvider>
    </ErrorBoundary>
  </Provider>
);

export default EditorPage;
