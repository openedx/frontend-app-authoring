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
import { invalidateComponentData } from './data/apiHooks';

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
    // The following function is called only if changes are saved:
    return ({ id: usageKey }) => {
      // invalidate any queries that involve this XBlock:
      invalidateComponentData(queryClient, libraryId, usageKey);
    };
  }, []);

  return (
    <LibraryProvider>
      <Routes>
        <Route
          path="editor/:blockType/:blockId?"
          element={(
            <PageWrap>
              <EditorContainer learningContextId={libraryId} onClose={goBack} afterSave={goBack} />
            </PageWrap>
          )}
        />
        <Route
          path="*"
          element={<LibraryAuthoringPage />}
        />
      </Routes>
    </LibraryProvider>
  );
};

export default LibraryLayout;
