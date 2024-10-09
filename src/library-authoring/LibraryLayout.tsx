import {
  Route,
  Routes,
  useParams,
} from 'react-router-dom';

import LibraryAuthoringPage from './LibraryAuthoringPage';
import { LibraryProvider } from './common/context';
import { CreateCollectionModal } from './create-collection';
import { LibraryTeamModal } from './library-team';
import LibraryCollectionPage from './collections/LibraryCollectionPage';
import { ComponentEditorModal } from './components/ComponentEditorModal';

const LibraryLayout = () => {
  const { libraryId } = useParams();

  if (libraryId === undefined) {
    // istanbul ignore next - This shouldn't be possible; it's just here to satisfy the type checker.
    throw new Error('Error: route is missing libraryId.');
  }

  return (
    <LibraryProvider libraryId={libraryId}>
      <Routes>
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
      <ComponentEditorModal />
      <LibraryTeamModal />
    </LibraryProvider>
  );
};

export default LibraryLayout;
