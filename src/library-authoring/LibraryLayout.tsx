import { useCallback } from 'react';
import {
  Route,
  Routes,
  useParams,
  useLocation,
} from 'react-router-dom';

import { ROUTES } from './routes';
import LibraryAuthoringPage from './LibraryAuthoringPage';
import { LibraryProvider } from './common/context/LibraryContext';
import { SidebarProvider } from './common/context/SidebarContext';
import { CreateCollectionModal } from './create-collection';
import LibraryCollectionPage from './collections/LibraryCollectionPage';
import { ComponentPicker } from './component-picker';
import { ComponentEditorModal } from './components/ComponentEditorModal';

const LibraryLayout = () => {
  const { libraryId } = useParams();

  if (libraryId === undefined) {
    // istanbul ignore next - This shouldn't be possible; it's just here to satisfy the type checker.
    throw new Error('Error: route is missing libraryId.');
  }

  const location = useLocation();
  const context = useCallback((childPage) => (
    <LibraryProvider
      /** We need to pass the pathname as key to the LibraryProvider to force a
       * re-render when we navigate to a new path or page. */
      key={location.pathname}
      libraryId={libraryId}
      /** The component picker modal to use. We need to pass it as a reference instead of
       * directly importing it to avoid the import cycle:
       * ComponentPicker > LibraryAuthoringPage/LibraryCollectionPage >
       * Sidebar > AddContentContainer > ComponentPicker */
      componentPicker={ComponentPicker}
    >
      <SidebarProvider>
        <>
          {childPage}
          <CreateCollectionModal />
          <ComponentEditorModal />
        </>
      </SidebarProvider>
    </LibraryProvider>
  ), [location.pathname]);

  return (
    <Routes>
      <Route
        path={ROUTES.COMPONENTS}
        element={context(<LibraryAuthoringPage />)}
      />
      <Route
        path={ROUTES.COLLECTIONS}
        element={context(<LibraryAuthoringPage />)}
      />
      <Route
        path={ROUTES.COMPONENT}
        element={context(<LibraryAuthoringPage />)}
      />
      <Route
        path={ROUTES.COLLECTION}
        element={context(<LibraryCollectionPage />)}
      />
      <Route
        path={ROUTES.HOME}
        element={context(<LibraryAuthoringPage />)}
      />
    </Routes>
  );
};

export default LibraryLayout;
