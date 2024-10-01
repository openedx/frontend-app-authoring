import { useToggle } from '@openedx/paragon';
import React from 'react';

import { ContentHit } from '../../search-manager';

export enum SidebarBodyComponentId {
  AddContent = 'add-content',
  Info = 'info',
  ComponentInfo = 'component-info',
  CollectionInfo = 'collection-info',
}

export interface LibraryContextData {
  /** The ID of the current library */
  libraryId: string;
  // Sidebar stuff - only one sidebar is active at any given time:
  sidebarBodyComponent: SidebarBodyComponentId | null;
  closeLibrarySidebar: () => void;
  openAddContentSidebar: () => void;
  openInfoSidebar: () => void;
  openComponentInfoSidebar: (componentHit: ContentHit) => void;
  currentComponentData?: ContentHit;
  isCreateCollectionModalOpen: boolean;
  openCreateCollectionModal: () => void;
  closeCreateCollectionModal: () => void;
  // Current collection
  openCollectionInfoSidebar: (collectionId: string) => void;
  currentCollectionId?: string;
  // Editor modal - for editing some component
  /** If the editor is open and the user is editing some component, this is its usageKey */
  componentBeingEdited: string | undefined;
  openComponentEditor: (usageKey: string) => void;
  closeComponentEditor: () => void;
}

/**
 * Library Context.
 * Always available when we're in the context of a single library.
 *
 * Get this using `useLibraryContext()`
 *
 * Not used on the "library list" on Studio home.
 */
const LibraryContext = React.createContext<LibraryContextData | undefined>(undefined);

/**
 * React component to provide `LibraryContext`
 */
export const LibraryProvider = (props: { children?: React.ReactNode, libraryId: string }) => {
  const [sidebarBodyComponent, setSidebarBodyComponent] = React.useState<SidebarBodyComponentId | null>(null);
  const [currentComponentData, setCurrentComponentData] = React.useState<ContentHit>();
  const [currentCollectionId, setcurrentCollectionId] = React.useState<string>();
  const [isCreateCollectionModalOpen, openCreateCollectionModal, closeCreateCollectionModal] = useToggle(false);
  const [componentBeingEdited, openComponentEditor] = React.useState<string | undefined>();
  const closeComponentEditor = React.useCallback(() => openComponentEditor(undefined), []);

  const resetSidebar = React.useCallback(() => {
    setCurrentComponentData(undefined);
    setcurrentCollectionId(undefined);
    setSidebarBodyComponent(null);
  }, []);

  const closeLibrarySidebar = React.useCallback(() => {
    resetSidebar();
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
    (componentHit: ContentHit) => {
      resetSidebar();
      setCurrentComponentData(componentHit);
      setSidebarBodyComponent(SidebarBodyComponentId.ComponentInfo);
    },
    [],
  );
  const openCollectionInfoSidebar = React.useCallback((collectionId: string) => {
    resetSidebar();
    setcurrentCollectionId(collectionId);
    setSidebarBodyComponent(SidebarBodyComponentId.CollectionInfo);
  }, []);

  const context = React.useMemo<LibraryContextData>(() => ({
    libraryId: props.libraryId,
    sidebarBodyComponent,
    closeLibrarySidebar,
    openAddContentSidebar,
    openInfoSidebar,
    openComponentInfoSidebar,
    currentComponentData,
    isCreateCollectionModalOpen,
    openCreateCollectionModal,
    closeCreateCollectionModal,
    openCollectionInfoSidebar,
    currentCollectionId,
    componentBeingEdited,
    openComponentEditor,
    closeComponentEditor,
  }), [
    props.libraryId,
    sidebarBodyComponent,
    closeLibrarySidebar,
    openAddContentSidebar,
    openInfoSidebar,
    openComponentInfoSidebar,
    currentComponentData,
    isCreateCollectionModalOpen,
    openCreateCollectionModal,
    closeCreateCollectionModal,
    openCollectionInfoSidebar,
    currentCollectionId,
    componentBeingEdited,
    openComponentEditor,
    closeComponentEditor,
  ]);

  return (
    <LibraryContext.Provider value={context}>
      {props.children}
    </LibraryContext.Provider>
  );
};

export function useLibraryContext(): LibraryContextData {
  const ctx = React.useContext(LibraryContext);
  if (ctx === undefined) {
    /* istanbul ignore next */
    throw new Error('useLibraryContext() was used in a component without a <LibraryProvider> ancestor.');
  }
  return ctx;
}
