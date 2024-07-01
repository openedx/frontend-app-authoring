/* eslint-disable react/prop-types */
// @ts-check
import React from 'react';

export const LibraryContext = React.createContext({
  sidebarBodyComponent: /** @type{null|string} */ (null),
  closeLibrarySidebar: /** @type{function} */ (() => {}),
  openAddContentSidebar: /** @type{function} */ (() => {}),
});

/**
 * React component to provide `LibraryContext`
 * @param {{children?: React.ReactNode}} props The components to wrap
 */
export const LibraryProvider = (props: {children?: React.ReactNode}) => {
  const [sidebarBodyComponent, setSidebarBodyComponent] = React.useState<string|null>(null);

  const closeLibrarySidebar = React.useCallback(() => setSidebarBodyComponent(null), []);
  const openAddContentSidebar = React.useCallback(() => setSidebarBodyComponent('add-content'), []);

  const context = React.useMemo(() => ({
    sidebarBodyComponent,
    closeLibrarySidebar,
    openAddContentSidebar,
  }), [sidebarBodyComponent, closeLibrarySidebar, openAddContentSidebar]);

  return (
    <LibraryContext.Provider value={context}>
      {props.children}
    </LibraryContext.Provider>
  );
};
