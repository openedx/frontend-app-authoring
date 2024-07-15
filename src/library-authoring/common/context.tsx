/* eslint-disable react/require-default-props */
import React from 'react';

enum SidebarBodyComponentId {
  AddContent = 'add-content',
}

export interface LibraryContextData {
  sidebarBodyComponent: SidebarBodyComponentId | null;
  closeLibrarySidebar: () => void;
  openAddContentSidebar: () => void;
}

export const LibraryContext = React.createContext({
  sidebarBodyComponent: null,
  closeLibrarySidebar: () => {},
  openAddContentSidebar: () => {},
} as LibraryContextData);

/**
 * React component to provide `LibraryContext`
 */
export const LibraryProvider = (props: { children?: React.ReactNode }) => {
  const [sidebarBodyComponent, setSidebarBodyComponent] = React.useState<SidebarBodyComponentId | null>(null);

  const closeLibrarySidebar = React.useCallback(() => setSidebarBodyComponent(null), []);
  const openAddContentSidebar = React.useCallback(() => setSidebarBodyComponent(SidebarBodyComponentId.AddContent), []);

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
