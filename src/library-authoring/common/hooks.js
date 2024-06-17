// @ts-check
import React from 'react';

const useLibraryContext = () => {
  const [sidebarBodyComponent, setSidebarBodyComponent] = React.useState(/** @type{null|string} */ (null));

  const closeLibrarySidebar = React.useCallback(() => setSidebarBodyComponent(null), [setSidebarBodyComponent]);
  const openAddContentSidebar = React.useCallback(() => setSidebarBodyComponent('add-content'), [setSidebarBodyComponent]);

  return {
    sidebarBodyComponent,
    closeLibrarySidebar,
    openAddContentSidebar,
  };
};

export default useLibraryContext;
