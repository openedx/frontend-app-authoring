import { useToggle } from '@openedx/paragon';
import React, {
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import type { ContentLibrary } from '../data/api';
import { useContentLibrary } from '../data/apiHooks';

export enum SidebarBodyComponentId {
  AddContent = 'add-content',
  Info = 'info',
  ComponentInfo = 'component-info',
  CollectionInfo = 'collection-info',
}

export interface LibraryContextData {
  /** The ID of the current library */
  libraryId: string;
  libraryData?: ContentLibrary;
  readOnly: boolean;
  isLoadingLibraryData: boolean;
  collectionId: string | undefined;
  setCollectionId: (collectionId?: string) => void;
  // Whether we're in "component picker" mode
  componentPickerMode: boolean;
  // Sidebar stuff - only one sidebar is active at any given time:
  sidebarBodyComponent: SidebarBodyComponentId | null;
  closeLibrarySidebar: () => void;
  openAddContentSidebar: () => void;
  openInfoSidebar: () => void;
  openComponentInfoSidebar: (usageKey: string) => void;
  sidebarComponentUsageKey?: string;
  // "Create New Collection" modal
  isCreateCollectionModalOpen: boolean;
  openCreateCollectionModal: () => void;
  closeCreateCollectionModal: () => void;
  // Current collection
  openCollectionInfoSidebar: (collectionId: string) => void;
  sidebarCollectionId?: string;
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

interface LibraryProviderProps {
  children?: React.ReactNode;
  libraryId: string;
  collectionId?: string;
  componentPickerMode?: boolean;
  sidebarCollectionId?: string;
  sidebarComponentUsageKey?: string;
}

/**
 * React component to provide `LibraryContext`
 */
export const LibraryProvider = ({
  children,
  libraryId,
  collectionId: collectionIdProp,
  componentPickerMode = false,
  sidebarCollectionId: sideBarCollectionIdProp,
  sidebarComponentUsageKey: sidebarComponentUsageKeyProp,
}: LibraryProviderProps) => {
  const [collectionId, setCollectionId] = useState(collectionIdProp);
  const [sidebarBodyComponent, setSidebarBodyComponent] = useState<SidebarBodyComponentId | null>(null);
  const [sidebarComponentUsageKey, setSidebarComponentUsageKey] = useState<string | undefined>(
    sidebarComponentUsageKeyProp,
  );
  const [sidebarCollectionId, setSidebarCollectionId] = useState<string | undefined>(sideBarCollectionIdProp);
  const [isCreateCollectionModalOpen, openCreateCollectionModal, closeCreateCollectionModal] = useToggle(false);
  const [componentBeingEdited, openComponentEditor] = useState<string | undefined>();
  const closeComponentEditor = useCallback(() => openComponentEditor(undefined), []);

  const resetSidebar = useCallback(() => {
    setSidebarComponentUsageKey(undefined);
    setSidebarCollectionId(undefined);
    setSidebarBodyComponent(null);
  }, []);

  const closeLibrarySidebar = useCallback(() => {
    resetSidebar();
    setSidebarComponentUsageKey(undefined);
  }, []);
  const openAddContentSidebar = useCallback(() => {
    resetSidebar();
    setSidebarBodyComponent(SidebarBodyComponentId.AddContent);
  }, []);
  const openInfoSidebar = useCallback(() => {
    resetSidebar();
    setSidebarBodyComponent(SidebarBodyComponentId.Info);
  }, []);
  const openComponentInfoSidebar = useCallback(
    (usageKey: string) => {
      resetSidebar();
      setSidebarComponentUsageKey(usageKey);
      setSidebarBodyComponent(SidebarBodyComponentId.ComponentInfo);
    },
    [],
  );
  const openCollectionInfoSidebar = useCallback((newCollectionId: string) => {
    resetSidebar();
    setSidebarCollectionId(newCollectionId);
    setSidebarBodyComponent(SidebarBodyComponentId.CollectionInfo);
  }, []);

  const { data: libraryData, isLoading: isLoadingLibraryData } = useContentLibrary(libraryId);

  const readOnly = componentPickerMode || !libraryData?.canEditLibrary;

  const context = useMemo<LibraryContextData>(() => ({
    libraryId,
    libraryData,
    collectionId,
    setCollectionId,
    readOnly,
    isLoadingLibraryData,
    componentPickerMode,
    sidebarBodyComponent,
    closeLibrarySidebar,
    openAddContentSidebar,
    openInfoSidebar,
    openComponentInfoSidebar,
    sidebarComponentUsageKey,
    isCreateCollectionModalOpen,
    openCreateCollectionModal,
    closeCreateCollectionModal,
    openCollectionInfoSidebar,
    sidebarCollectionId,
    componentBeingEdited,
    openComponentEditor,
    closeComponentEditor,
  }), [
    libraryId,
    collectionId,
    setCollectionId,
    libraryData,
    readOnly,
    isLoadingLibraryData,
    componentPickerMode,
    sidebarBodyComponent,
    closeLibrarySidebar,
    openAddContentSidebar,
    openInfoSidebar,
    openComponentInfoSidebar,
    sidebarComponentUsageKey,
    isCreateCollectionModalOpen,
    openCreateCollectionModal,
    closeCreateCollectionModal,
    openCollectionInfoSidebar,
    sidebarCollectionId,
    componentBeingEdited,
    openComponentEditor,
    closeComponentEditor,
  ]);

  return (
    <LibraryContext.Provider value={context}>
      {children}
    </LibraryContext.Provider>
  );
};

export function useLibraryContext(): LibraryContextData {
  const ctx = useContext(LibraryContext);
  if (ctx === undefined) {
    /* istanbul ignore next */
    throw new Error('useLibraryContext() was used in a component without a <LibraryProvider> ancestor.');
  }
  return ctx;
}
