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
import LibraryCollectionPageWrapper from './LibraryCollectionPage';
import LibraryCollectionPageWrapper from './collections/LibraryCollectionPage';

const LibraryLayout = () => {
  const { libraryId } = useParams();
  const queryClient = useQueryClient();

  if (libraryId === undefined) {
    // istanbul ignore next - This shouldn't be possible; it's just here to satisfy the type checker.
    throw new Error('Error: route is missing libraryId.');
  }

  const navigate = useNavigate();
  const goBack = React.useCallback(() => {
    // Go back to the library
    navigate(`/library/${libraryId}`);
  }, []);
  const returnFunction = React.useCallback(() => {
    // When changes are cancelled, either onClose (goBack) or this returnFunction will be called.
    // When changes are saved, this returnFunction is called.
    goBack();
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
    <LibraryProvider>
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
          path="collections/:collectionId"
          element={<LibraryCollectionPageWrapper />}
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
