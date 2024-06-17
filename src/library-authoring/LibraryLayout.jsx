// @ts-check
import React from 'react';
import { LibraryContext, useLibraryContext } from './common';
import LibraryAuthoringPage from './LibraryAuthoringPage';

const LibraryLayout = () => {
  const context = useLibraryContext();

  return (
    <LibraryContext.Provider value={context}>
      <LibraryAuthoringPage />
    </LibraryContext.Provider>
  );
};

export default LibraryLayout;
