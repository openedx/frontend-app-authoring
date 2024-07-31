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
    throw new Error('Error: route is missing libraryId.'); // Should never happen
  }

  const navigate = useNavigate();
  const goBack = React.useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1); // go back
    } else {
      navigate(`/library/${libraryId}`);
    }
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
              <EditorContainer learningContextId={libraryId} onClose={goBack} onSave={goBack} />
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
