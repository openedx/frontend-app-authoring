import { useToggle } from '@openedx/paragon';
import React, {
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import type { ComponentPicker } from '../../component-picker';
import type { ContentLibrary } from '../../data/api';
import { useContentLibrary } from '../../data/apiHooks';
import { useComponentPickerContext } from './ComponentPickerContext';

export enum SidebarBodyComponentId {
  AddContent = 'add-content',
  Info = 'info',
  ComponentInfo = 'component-info',
  CollectionInfo = 'collection-info',
}

export const COLLECTION_INFO_TABS = {
  Manage: 'manage',
  Details: 'details',
} as const;
export type CollectionInfoTab = typeof COLLECTION_INFO_TABS[keyof typeof COLLECTION_INFO_TABS];
export const isCollectionInfoTab = (tab: string): tab is CollectionInfoTab => (
  Object.values<string>(COLLECTION_INFO_TABS).includes(tab)
);

export const COMPONENT_INFO_TABS = {
  Preview: 'preview',
  Manage: 'manage',
  Details: 'details',
} as const;
export type ComponentInfoTab = typeof COMPONENT_INFO_TABS[keyof typeof COMPONENT_INFO_TABS];
export const isComponentInfoTab = (tab: string): tab is ComponentInfoTab => (
  Object.values<string>(COMPONENT_INFO_TABS).includes(tab)
);

export interface SidebarComponentInfo {
  type: SidebarBodyComponentId;
  id: string;
  /** Additional action on Sidebar display */
  additionalAction?: SidebarAdditionalActions;
  /** Current tab in the sidebar */
  currentTab?: CollectionInfoTab | ComponentInfoTab;
}

export interface ComponentEditorInfo {
  usageKey: string;
  onClose?: () => void;
}

export enum SidebarAdditionalActions {
  JumpToAddCollections = 'jump-to-add-collections',
}

export type LibraryContextData = {
  /** The ID of the current library */
  libraryId: string;
  libraryData?: ContentLibrary;
  readOnly: boolean;
  isLoadingLibraryData: boolean;
  collectionId: string | undefined;
  setCollectionId: (collectionId?: string) => void;
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
  /** If the editor is open and the user is editing some component, this is the component being edited. */
  componentBeingEdited: ComponentEditorInfo | undefined;
  /** If an onClose callback is provided, it will be called when the editor is closed. */
  openComponentEditor: (usageKey: string, onClose?: () => void) => void;
  closeComponentEditor: () => void;
  resetSidebarAdditionalActions: () => void;
  setSidebarCurrentTab: (tab: CollectionInfoTab | ComponentInfoTab) => void;
  componentPicker?: typeof ComponentPicker;
};

/**
 * Library Context.
 * Always available when we're in the context of a single library.
 *
 * Get this using `useLibraryContext()`
 *
 * Not used on the "library list" on Studio home.
 */
const LibraryContext = React.createContext<LibraryContextData | undefined>(undefined);

type LibraryProviderProps = {
  children?: React.ReactNode;
  libraryId: string;
  /** The initial collection ID to show */
  collectionId?: string;
  showOnlyPublished?: boolean;
  /** Only used for testing */
  initialSidebarComponentInfo?: SidebarComponentInfo;
  /** The component picker modal to use. We need to pass it as a reference instead of
   * directly importing it to avoid the import cycle:
   * ComponentPicker > LibraryAuthoringPage/LibraryCollectionPage >
   * Sidebar > AddContentContainer > ComponentPicker */
  componentPicker?: typeof ComponentPicker;
};

/**
 * React component to provide `LibraryContext`
 */
export const LibraryProvider = ({
  children,
  libraryId,
  collectionId: collectionIdProp,
  showOnlyPublished = false,
  initialSidebarComponentInfo,
  componentPicker,
}: LibraryProviderProps) => {
  const [collectionId, setCollectionId] = useState(collectionIdProp);
  const [sidebarComponentInfo, setSidebarComponentInfo] = useState<SidebarComponentInfo | undefined>(
    initialSidebarComponentInfo,
  );
  const [isLibraryTeamModalOpen, openLibraryTeamModal, closeLibraryTeamModal] = useToggle(false);
  const [isCreateCollectionModalOpen, openCreateCollectionModal, closeCreateCollectionModal] = useToggle(false);
  const [componentBeingEdited, setComponentBeingEdited] = useState<ComponentEditorInfo | undefined>();
  const closeComponentEditor = useCallback(() => {
    setComponentBeingEdited((prev) => {
      prev?.onClose?.();
      return undefined;
    });
  }, []);
  const openComponentEditor = useCallback((usageKey: string, onClose?: () => void) => {
    setComponentBeingEdited({ usageKey, onClose });
  }, []);

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
    setSidebarComponentInfo((prev) => ({
      ...prev,
      id: usageKey,
      type: SidebarBodyComponentId.ComponentInfo,
      additionalAction,
    }));
  }, []);

  const openCollectionInfoSidebar = useCallback((
    newCollectionId: string,
    additionalAction?: SidebarAdditionalActions,
  ) => {
    setSidebarComponentInfo((prev) => ({
      ...prev,
      id: newCollectionId,
      type: SidebarBodyComponentId.CollectionInfo,
      additionalAction,
    }));
  }, []);

  const setSidebarCurrentTab = useCallback((tab: CollectionInfoTab | ComponentInfoTab) => {
    setSidebarComponentInfo((prev) => (prev && { ...prev, currentTab: tab }));
  }, []);

  const { data: libraryData, isLoading: isLoadingLibraryData } = useContentLibrary(libraryId);

  const {
    componentPickerMode,
  } = useComponentPickerContext();

  const readOnly = !!componentPickerMode || !libraryData?.canEditLibrary;

  const context = useMemo<LibraryContextData>(() => {
    const contextValue = {
      libraryId,
      libraryData,
      collectionId,
      setCollectionId,
      readOnly,
      isLoadingLibraryData,
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
      setSidebarCurrentTab,
      componentPicker,
    };

    return contextValue;
  }, [
    libraryId,
    collectionId,
    setCollectionId,
    libraryData,
    readOnly,
    isLoadingLibraryData,
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
    componentPicker,
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
