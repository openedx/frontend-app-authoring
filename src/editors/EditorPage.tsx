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
  lmsEndpointUrl?: string;
  studioEndpointUrl?: string;
  fullScreen?: boolean;
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
  lmsEndpointUrl = null,
  studioEndpointUrl = null,
  onClose = null,
  returnFunction = null,
  fullScreen = true,
}) => (
  <Provider store={store}>
    <ErrorBoundary
      {...{
        learningContextId: courseId,
        studioEndpointUrl,
      }}
    >
      <EditorContextProvider fullScreen={fullScreen} learningContextId={courseId}>
        <Editor
          {...{
            onClose,
            learningContextId: courseId,
            blockType,
            blockId,
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
