import { useToggle } from '@openedx/paragon';
import React from 'react';
import type { CollectionHit } from '../../search-manager';

export enum SidebarBodyComponentId {
  AddContent = 'add-content',
  Info = 'info',
  ComponentInfo = 'component-info',
  CollectionInfo = 'collection-info',
}

export interface LibraryContextData {
  sidebarBodyComponent: SidebarBodyComponentId | null;
  closeLibrarySidebar: () => void;
  openAddContentSidebar: () => void;
  openInfoSidebar: () => void;
  openComponentInfoSidebar: (usageKey: string) => void;
  currentComponentUsageKey?: string;
  isCreateCollectionModalOpen: boolean;
  openCreateCollectionModal: () => void;
  closeCreateCollectionModal: () => void;
  openCollectionInfoSidebar: (collectionHit: CollectionHit) => void
  currentCollectionHit?: CollectionHit;
}

export const LibraryContext = React.createContext({
  sidebarBodyComponent: null,
  closeLibrarySidebar: () => {},
  openAddContentSidebar: () => {},
  openInfoSidebar: () => {},
  openComponentInfoSidebar: (_usageKey: string) => {}, // eslint-disable-line @typescript-eslint/no-unused-vars
  isCreateCollectionModalOpen: false,
  openCreateCollectionModal: () => {},
  closeCreateCollectionModal: () => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  openCollectionInfoSidebar: (_collectionHit: CollectionHit) => {},
} as LibraryContextData);

/**
 * React component to provide `LibraryContext`
 */
export const LibraryProvider = (props: { children?: React.ReactNode }) => {
  const [sidebarBodyComponent, setSidebarBodyComponent] = React.useState<SidebarBodyComponentId | null>(null);
  const [currentComponentUsageKey, setCurrentComponentUsageKey] = React.useState<string>();
  const [currentCollectionHit, setcurrentCollectionHit] = React.useState<CollectionHit>();
  const [isCreateCollectionModalOpen, openCreateCollectionModal, closeCreateCollectionModal] = useToggle(false);

  const resetSidebar = React.useCallback(() => {
    setCurrentComponentUsageKey(undefined);
    setcurrentCollectionHit(undefined);
    setSidebarBodyComponent(null);
  }, []);

  const closeLibrarySidebar = React.useCallback(() => {
    resetSidebar();
    setCurrentComponentUsageKey(undefined);
  }, []);
  const openAddContentSidebar = React.useCallback(() => {
    resetSidebar();
    setSidebarBodyComponent(SidebarBodyComponentId.AddContent);
  }, []);
  const openInfoSidebar = React.useCallback(() => {
    resetSidebar();
    setSidebarBodyComponent(SidebarBodyComponentId.Info);
  }, []);
  const openComponentInfoSidebar = React.useCallback(
    (usageKey: string) => {
      resetSidebar();
      setCurrentComponentUsageKey(usageKey);
      setSidebarBodyComponent(SidebarBodyComponentId.ComponentInfo);
    },
    [],
  );
  const openCollectionInfoSidebar = React.useCallback((collectionHit: CollectionHit) => {
    resetSidebar();
    setcurrentCollectionHit(collectionHit);
    setSidebarBodyComponent(SidebarBodyComponentId.CollectionInfo);
  }, []);

  const context = React.useMemo(() => ({
    sidebarBodyComponent,
    closeLibrarySidebar,
    openAddContentSidebar,
    openInfoSidebar,
    openComponentInfoSidebar,
    currentComponentUsageKey,
    isCreateCollectionModalOpen,
    openCreateCollectionModal,
    closeCreateCollectionModal,
    openCollectionInfoSidebar,
    currentCollectionHit,
  }), [
    sidebarBodyComponent,
    closeLibrarySidebar,
    openAddContentSidebar,
    openInfoSidebar,
    openComponentInfoSidebar,
    currentComponentUsageKey,
    isCreateCollectionModalOpen,
    openCreateCollectionModal,
    closeCreateCollectionModal,
    openCollectionInfoSidebar,
    currentCollectionHit,
  ]);

  return (
    <LibraryContext.Provider value={context}>
      {props.children}
    </LibraryContext.Provider>
  );
};
