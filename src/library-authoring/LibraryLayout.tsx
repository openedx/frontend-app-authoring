import React from 'react';
import LibraryAuthoringPage from './LibraryAuthoringPage';
import { LibraryProvider } from './common/context';
import { CreateCollectionModal } from './create-collection';

const LibraryLayout = () => (
  <LibraryProvider>
    <LibraryAuthoringPage />
    <CreateCollectionModal />
  </LibraryProvider>
);

export default LibraryLayout;
