import {
  Route,
  Routes,
  useParams,
  useMatch,
} from 'react-router-dom';

import LibraryAuthoringPage from './LibraryAuthoringPage';
import { LibraryProvider } from './common/context/LibraryContext';
import { SidebarProvider } from './common/context/SidebarContext';
import { CreateCollectionModal } from './create-collection';
import LibraryCollectionPage from './collections/LibraryCollectionPage';
import { ComponentPicker } from './component-picker';
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
    <LibraryProvider
      /** We need to pass the collectionId as key to the LibraryProvider to force a re-render
      * when we navigate to a collection page. */
      key={collectionId}
      libraryId={libraryId}
      collectionId={collectionId}
        /** The component picker modal to use. We need to pass it as a reference instead of
         * directly importing it to avoid the import cycle:
         * ComponentPicker > LibraryAuthoringPage/LibraryCollectionPage >
         * Sidebar > AddContentContainer > ComponentPicker */
      componentPicker={ComponentPicker}
    >
      <SidebarProvider>
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
      </SidebarProvider>
    </LibraryProvider>
  );
};

export default LibraryLayout;
