import React from 'react';
import {
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { PageWrap } from '@edx/frontend-platform/react';
import { useQueryClient } from '@tanstack/react-query';

import EditorContainer from '../editors/EditorContainer';
import LibraryAuthoringPage from './LibraryAuthoringPage';
import { LibraryProvider } from './common/context';
import { CreateCollectionModal } from './create-collection';
import { invalidateComponentData } from './data/apiHooks';
import LibraryCollectionPage from './collections/LibraryCollectionPage';

const LibraryLayout = () => {
  const { libraryId } = useParams();
  const queryClient = useQueryClient();

  if (libraryId === undefined) {
    // istanbul ignore next - This shouldn't be possible; it's just here to satisfy the type checker.
    throw new Error('Error: route is missing libraryId.');
  }

  const navigate = useNavigate();
  const goBack = React.useCallback((prevPath?: string) => {
    if (prevPath) {
      // Redirects back to the previous route like collection page or library page
      navigate(prevPath);
    } else {
      // Go back to the library
      navigate(`/library/${libraryId}`);
    }
  }, []);

  const returnFunction = React.useCallback((prevPath?: string) => {
    // When changes are cancelled, either onClose (goBack) or this returnFunction will be called.
    // When changes are saved, this returnFunction is called.
    goBack(prevPath);
    return (args) => {
      if (args === undefined) {
        return; // Do nothing - the user cancelled the changes
      }
      const { id: usageKey } = args;
      // invalidate any queries that involve this XBlock:
      invalidateComponentData(queryClient, libraryId, usageKey);
    };
  }, [goBack]);

  return (
    <LibraryProvider libraryId={libraryId}>
      <Routes>
        {/*
          TODO: we should be opening this editor as a modal, not making it a separate page/URL.
          That will be a much nicer UX because users can just close the modal and be on the same page they were already
          on, instead of always getting sent back to the library home.
        */}
        <Route
          path="editor/:blockType/:blockId?"
          element={(
            <PageWrap>
              <EditorContainer learningContextId={libraryId} onClose={goBack} returnFunction={returnFunction} />
            </PageWrap>
          )}
        />
        <Route
          path="collection/:collectionId"
          element={<LibraryCollectionPage />}
        />
        <Route
          path="*"
          element={<LibraryAuthoringPage />}
        />
      </Routes>
      <CreateCollectionModal />
    </LibraryProvider>
  );
};

export default LibraryLayout;
