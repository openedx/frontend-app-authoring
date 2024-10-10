import {
  useParams,
  useMatch,
} from 'react-router-dom';

import LibraryAuthoringPage from './LibraryAuthoringPage';
import { LibraryProvider } from './common/context';
import { CreateCollectionModal } from './create-collection';
import LibraryCollectionPage from './collections/LibraryCollectionPage';
import { ComponentEditorModal } from './components/ComponentEditorModal';

const LibraryLayout = () => {
  const { libraryId } = useParams();

  const match = useMatch('/library/:libraryId/collection/:collectionId');

  const collectionId = match?.params.collectionId;

  if (libraryId === undefined) {
    // istanbul ignore next - This shouldn't be possible; it's just here to satisfy the type checker.
    throw new Error('Error: route is missing libraryId.');
  }

  return (
    <LibraryProvider key={collectionId} libraryId={libraryId} collectionId={collectionId}>
      {collectionId ? (
        <LibraryCollectionPage />
      ) : (
        <LibraryAuthoringPage />
      )}
      <CreateCollectionModal />
      <ComponentEditorModal />
    </LibraryProvider>
  );
};

export default LibraryLayout;
