import { useCallback } from 'react';
import {
  Route,
  Routes,
  useMatch,
  useParams,
  type PathMatch,
} from 'react-router-dom';

import { BASE_ROUTE, ROUTES } from './routes';
import LibraryAuthoringPage from './LibraryAuthoringPage';
import { LibraryProvider } from './common/context/LibraryContext';
import { SidebarProvider } from './common/context/SidebarContext';
import { CreateCollectionModal } from './create-collection';
import { CreateUnitModal } from './create-unit';
import LibraryCollectionPage from './collections/LibraryCollectionPage';
import { ComponentPicker } from './component-picker';
import { ComponentEditorModal } from './components/ComponentEditorModal';
import { LibraryUnitPage } from './units';

const LibraryLayout = () => {
  const { libraryId } = useParams();

  if (libraryId === undefined) {
    // istanbul ignore next - This shouldn't be possible; it's just here to satisfy the type checker.
    throw new Error('Error: route is missing libraryId.');
  }

  // The top-level route is `${BASE_ROUTE}/*`, so match will always be non-null.
  const matchCollection = useMatch(`${BASE_ROUTE}${ROUTES.COLLECTION}`) as PathMatch<'libraryId' | 'collectionId'> | null;
  const collectionId = matchCollection?.params.collectionId;

  // The top-level route is `${BASE_ROUTE}/*`, so match will always be non-null.
  const matchUnit = useMatch(`${BASE_ROUTE}${ROUTES.UNIT}`) as PathMatch<'libraryId' | 'unitId'> | null;
  const unitId = matchUnit?.params.unitId;

  const context = useCallback((childPage) => (
    <LibraryProvider
      /** We need to pass the collectionId or unitId as key to the LibraryProvider to force a re-render
        * when we navigate to a collection or unit page. */
      key={collectionId || unitId}
      libraryId={libraryId}
      /** The component picker modal to use. We need to pass it as a reference instead of
       * directly importing it to avoid the import cycle:
       * ComponentPicker > LibraryAuthoringPage/LibraryCollectionPage >
       * Sidebar > AddContent > ComponentPicker */
      componentPicker={ComponentPicker}
    >
      <SidebarProvider>
        <>
          {childPage}
          <CreateCollectionModal />
          <CreateUnitModal />
          <ComponentEditorModal />
        </>
      </SidebarProvider>
    </LibraryProvider>
  ), [collectionId, unitId]);

  return (
    <Routes>
      {[
        ROUTES.HOME,
        ROUTES.COMPONENT,
        ROUTES.COMPONENTS,
        ROUTES.COLLECTIONS,
        ROUTES.UNITS,
      ].map((route) => (
        <Route
          key={route}
          path={route}
          element={context(<LibraryAuthoringPage />)}
        />
      ))}
      <Route
        path={ROUTES.COLLECTION}
        element={context(<LibraryCollectionPage />)}
      />
      <Route
        path={ROUTES.UNIT}
        element={context(<LibraryUnitPage />)}
      />
    </Routes>
  );
};

export default LibraryLayout;
