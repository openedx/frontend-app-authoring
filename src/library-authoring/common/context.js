// @ts-check
import React from 'react';

const LibraryContext = React.createContext({
  sidebarBodyComponent: /** @type{null|string} */ (null),
  closeLibrarySidebar: /** @type{function} */ (() => {}),
  openAddContentSidebar: /** @type{function} */ (() => {}),
});

export default LibraryContext;
