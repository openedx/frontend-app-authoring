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

export enum SidebarAdditionalActions {
  JumpToAddCollections = 'jump-to-add-collections',
}

export interface SidebarComponentInfo {
  type: SidebarBodyComponentId;
  id: string;
  /** Additional action on Sidebar display */
  additionalAction?: SidebarAdditionalActions;
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
  // Only show published components
  showOnlyPublished: boolean;
  // Sidebar stuff - only one sidebar is active at any given time:
  closeLibrarySidebar: () => void;
  openAddContentSidebar: () => void;
  openInfoSidebar: () => void;
  openComponentInfoSidebar: (usageKey: string, additionalAction?: SidebarAdditionalActions) => void;
  sidebarComponentInfo?: SidebarComponentInfo;
  // "Library Team" modal
  isLibraryTeamModalOpen: boolean;
  openLibraryTeamModal: () => void;
  closeLibraryTeamModal: () => void;
  // "Create New Collection" modal
  isCreateCollectionModalOpen: boolean;
  openCreateCollectionModal: () => void;
  closeCreateCollectionModal: () => void;
  // Current collection
  openCollectionInfoSidebar: (collectionId: string, additionalAction?: SidebarAdditionalActions) => void;
  // Editor modal - for editing some component
  /** If the editor is open and the user is editing some component, this is its usageKey */
  componentBeingEdited: string | undefined;
  openComponentEditor: (usageKey: string) => void;
  closeComponentEditor: () => void;
  resetSidebarAdditionalActions: () => void;
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
  /** The initial collection ID to show */
  collectionId?: string;
  /** The component picker mode is a special mode where the user is selecting a component to add to a Unit (or another
   *  XBlock) */
  componentPickerMode?: boolean;
  showOnlyPublished?: boolean;
  /** Only used for testing */
  initialSidebarComponentInfo?: SidebarComponentInfo;
}

/**
 * React component to provide `LibraryContext`
 */
export const LibraryProvider = ({
  children,
  libraryId,
  collectionId: collectionIdProp,
  componentPickerMode = false,
  showOnlyPublished = false,
  initialSidebarComponentInfo,
}: LibraryProviderProps) => {
  const [collectionId, setCollectionId] = useState(collectionIdProp);
  const [sidebarComponentInfo, setSidebarComponentInfo] = useState<SidebarComponentInfo | undefined>(
    initialSidebarComponentInfo,
  );
  const [isLibraryTeamModalOpen, openLibraryTeamModal, closeLibraryTeamModal] = useToggle(false);
  const [isCreateCollectionModalOpen, openCreateCollectionModal, closeCreateCollectionModal] = useToggle(false);
  const [componentBeingEdited, openComponentEditor] = useState<string | undefined>();
  const closeComponentEditor = useCallback(() => openComponentEditor(undefined), []);

  /** Helper function to consume addtional action once performed.
    Required to redo the action.
  */
  const resetSidebarAdditionalActions = useCallback(() => {
    setSidebarComponentInfo((prev) => (prev && { ...prev, additionalAction: undefined }));
  }, []);

  const closeLibrarySidebar = useCallback(() => {
    setSidebarComponentInfo(undefined);
  }, []);
  const openAddContentSidebar = useCallback(() => {
    setSidebarComponentInfo({ id: '', type: SidebarBodyComponentId.AddContent });
  }, []);
  const openInfoSidebar = useCallback(() => {
    setSidebarComponentInfo({ id: '', type: SidebarBodyComponentId.Info });
  }, []);
  const openComponentInfoSidebar = useCallback((usageKey: string, additionalAction?: SidebarAdditionalActions) => {
    setSidebarComponentInfo({
      id: usageKey,
      type: SidebarBodyComponentId.ComponentInfo,
      additionalAction,
    });
  }, []);
  const openCollectionInfoSidebar = useCallback((
    newCollectionId: string,
    additionalAction?: SidebarAdditionalActions,
  ) => {
    setSidebarComponentInfo({
      id: newCollectionId,
      type: SidebarBodyComponentId.CollectionInfo,
      additionalAction,
    });
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
    showOnlyPublished,
    closeLibrarySidebar,
    openAddContentSidebar,
    openInfoSidebar,
    openComponentInfoSidebar,
    sidebarComponentInfo,
    isLibraryTeamModalOpen,
    openLibraryTeamModal,
    closeLibraryTeamModal,
    isCreateCollectionModalOpen,
    openCreateCollectionModal,
    closeCreateCollectionModal,
    openCollectionInfoSidebar,
    componentBeingEdited,
    openComponentEditor,
    closeComponentEditor,
    resetSidebarAdditionalActions,
  }), [
    libraryId,
    collectionId,
    setCollectionId,
    libraryData,
    readOnly,
    isLoadingLibraryData,
    componentPickerMode,
    showOnlyPublished,
    closeLibrarySidebar,
    openAddContentSidebar,
    openInfoSidebar,
    openComponentInfoSidebar,
    sidebarComponentInfo,
    isLibraryTeamModalOpen,
    openLibraryTeamModal,
    closeLibraryTeamModal,
    isCreateCollectionModalOpen,
    openCreateCollectionModal,
    closeCreateCollectionModal,
    openCollectionInfoSidebar,
    componentBeingEdited,
    openComponentEditor,
    closeComponentEditor,
    resetSidebarAdditionalActions,
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
