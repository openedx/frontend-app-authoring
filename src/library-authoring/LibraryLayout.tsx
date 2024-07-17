import React from 'react';
import LibraryAuthoringPage from './LibraryAuthoringPage';
import { LibraryProvider } from './common/context';

const LibraryLayout = () => (
  <LibraryProvider>
    <LibraryAuthoringPage />
  </LibraryProvider>
);

export default LibraryLayout;
