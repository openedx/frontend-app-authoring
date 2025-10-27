import React from 'react';
import {
  Outlet,
  Route,
  Routes,
  useParams,
} from 'react-router-dom';

import { LibraryBackupPage } from '@src/library-authoring/backup-restore';
import LibraryAuthoringPage from './LibraryAuthoringPage';
import LibraryCollectionPage from './collections/LibraryCollectionPage';
import { LibraryProvider } from './common/context/LibraryContext';
import { SidebarProvider } from './common/context/SidebarContext';
import { ComponentPicker } from './component-picker';
import { ComponentEditorModal } from './components/ComponentEditorModal';
import { CreateCollectionModal } from './create-collection';
import { CreateContainerModal } from './create-container';
import { ROUTES } from './routes';
import { LibrarySectionPage, LibrarySubsectionPage } from './section-subsections';
import { LibraryUnitPage } from './units';
import { LibraryTeamModal } from './library-team';

const LibraryLayoutWrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
  const {
    libraryId, collectionId, containerId,
  } = useParams();

  if (libraryId === undefined) {
    // istanbul ignore next - This shouldn't be possible; it's just here to satisfy the type checker.
    throw new Error('Error: route is missing libraryId.');
  }

  return (
    <LibraryProvider
      /** NOTE: We need to pass the collectionId or containerId as key to the LibraryProvider to force a re-render
        * when we navigate to a collection or container page. This is necessary to make the back/forward navigation
        * work correctly, as the LibraryProvider needs to rebuild the state from the URL.
        * */
      key={collectionId || containerId}
      libraryId={libraryId}
      /** NOTE: The component picker modal to use. We need to pass it as a reference instead of
       * directly importing it to avoid the import cycle:
       * ComponentPicker > LibraryAuthoringPage/LibraryCollectionPage >
       * Sidebar > AddContent > ComponentPicker */
      componentPicker={ComponentPicker}
    >
      <SidebarProvider>
        {children ?? <Outlet />}
        <CreateCollectionModal />
        <CreateContainerModal />
        <ComponentEditorModal />
        <LibraryTeamModal />
      </SidebarProvider>
    </LibraryProvider>
  );
};

const LibraryLayout = () => (
  <Routes>
    <Route element={<LibraryLayoutWrapper />}>
      {[
        ROUTES.HOME,
        ROUTES.COMPONENTS,
        ROUTES.COLLECTIONS,
        ROUTES.UNITS,
        ROUTES.SECTIONS,
        ROUTES.SUBSECTIONS,
      ].map((route) => (
        <Route
          key={route}
          path={route}
          Component={LibraryAuthoringPage}
        />
      ))}
      <Route
        path={ROUTES.COLLECTION}
        Component={LibraryCollectionPage}
      />
      <Route
        path={ROUTES.SECTION}
        Component={LibrarySectionPage}
      />
      <Route
        path={ROUTES.SUBSECTION}
        Component={LibrarySubsectionPage}
      />
      <Route
        path={ROUTES.UNIT}
        Component={LibraryUnitPage}
      />
      <Route
        path={ROUTES.BACKUP}
        Component={LibraryBackupPage}
      />
    </Route>
  </Routes>
);

export default LibraryLayout;
