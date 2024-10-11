import { useToggle } from '@openedx/paragon';
import React from 'react';

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
  openComponentInfoSidebar: (usageKey: string) => void;
  currentComponentUsageKey?: string;
  // "Create New Collection" modal
  isCreateCollectionModalOpen: boolean;
  openCreateCollectionModal: () => void;
  closeCreateCollectionModal: () => void;
  // Current collection
  openCollectionInfoSidebar: (collectionId: string, collectionUsageKey: string) => void;
  currentCollectionId?: string;
  currentCollectionUsageKey?: string;
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
  const [currentComponentUsageKey, setCurrentComponentUsageKey] = React.useState<string>();
  const [currentCollectionId, setCurrentCollectionId] = React.useState<string>();
  const [currentCollectionUsageKey, setCurrentCollectionUsageKey] = React.useState<string>();
  const [isCreateCollectionModalOpen, openCreateCollectionModal, closeCreateCollectionModal] = useToggle(false);
  const [componentBeingEdited, openComponentEditor] = React.useState<string | undefined>();
  const closeComponentEditor = React.useCallback(() => openComponentEditor(undefined), []);

  const resetSidebar = React.useCallback(() => {
    setCurrentComponentUsageKey(undefined);
    setCurrentCollectionId(undefined);
    setCurrentCollectionUsageKey(undefined);
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
  const openCollectionInfoSidebar = React.useCallback((collectionId: string, collectionUsageKey: string) => {
    resetSidebar();
    setCurrentCollectionId(collectionId);
    setCurrentCollectionUsageKey(collectionUsageKey);
    setSidebarBodyComponent(SidebarBodyComponentId.CollectionInfo);
  }, []);

  const context = React.useMemo<LibraryContextData>(() => ({
    libraryId: props.libraryId,
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
    currentCollectionId,
    currentCollectionUsageKey,
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
    currentComponentUsageKey,
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
