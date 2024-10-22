import { useToggle } from '@openedx/paragon';
import React, {
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import type { ContentLibrary } from '../data/api';
import { useContentLibrary } from '../data/apiHooks';

interface SelectedComponent {
  usageKey: string;
  blockType: string;
}

export type ComponentSelectedEvent = (selectedComponent: SelectedComponent) => void;

type NoComponentPickerType = {
  componentPickerMode?: undefined;
  onComponentSelected?: never;
  selectedComponents?: never;
  addComponentToSelectedComponents?: never;
  removeComponentFromSelectedComponents?: never;
};

type ComponentPickerSingleType = {
  componentPickerMode: 'single';
  onComponentSelected: ComponentSelectedEvent;
  selectedComponents?: never;
  addComponentToSelectedComponents?: never;
  removeComponentFromSelectedComponents?: never;
};

type ComponentPickerMultipleType = {
  componentPickerMode: 'multiple';
  onComponentSelected?: never;
  selectedComponents: SelectedComponent[];
  addComponentToSelectedComponents: ComponentSelectedEvent;
  removeComponentFromSelectedComponents: ComponentSelectedEvent;
};

type ComponentPickerType = NoComponentPickerType | ComponentPickerSingleType | ComponentPickerMultipleType;

export enum SidebarBodyComponentId {
  AddContent = 'add-content',
  Info = 'info',
  ComponentInfo = 'component-info',
  CollectionInfo = 'collection-info',
}

export type LibraryContextData = {
  /** The ID of the current library */
  libraryId: string;
  libraryData?: ContentLibrary;
  readOnly: boolean;
  isLoadingLibraryData: boolean;
  collectionId: string | undefined;
  setCollectionId: (collectionId?: string) => void;
  // Sidebar stuff - only one sidebar is active at any given time:
  sidebarBodyComponent: SidebarBodyComponentId | null;
  closeLibrarySidebar: () => void;
  openAddContentSidebar: () => void;
  openInfoSidebar: () => void;
  openComponentInfoSidebar: (usageKey: string) => void;
  sidebarComponentUsageKey?: string;
  // "Library Team" modal
  isLibraryTeamModalOpen: boolean;
  openLibraryTeamModal: () => void;
  closeLibraryTeamModal: () => void;
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
} & ComponentPickerType;

/**
 * Library Context.
 * Always available when we're in the context of a single library.
 *
 * Get this using `useLibraryContext()`
 *
 * Not used on the "library list" on Studio home.
 */
const LibraryContext = React.createContext<LibraryContextData | undefined>(undefined);

type NoComponentPickerProps = {
  componentPickerMode?: undefined;
  onComponentSelected?: never;
};

export type ComponentPickerSingleProps = {
  componentPickerMode: 'single';
  onComponentSelected: ComponentSelectedEvent;
};

export type ComponentPickerMultipleProps = {
  componentPickerMode: 'multiple';
  onComponentSelected?: never;
};

type ComponentPickerProps = NoComponentPickerProps | ComponentPickerSingleProps | ComponentPickerMultipleProps;

type LibraryProviderProps = {
  children?: React.ReactNode;
  libraryId: string;
  /** The initial collection ID to show */
  collectionId?: string;
  /** Only used for testing */
  initialSidebarComponentUsageKey?: string;
  /** Only used for testing */
  initialSidebarCollectionId?: string;
} & ComponentPickerProps;

/**
 * React component to provide `LibraryContext`
 */
export const LibraryProvider = ({
  children,
  libraryId,
  collectionId: collectionIdProp,
  componentPickerMode,
  onComponentSelected,
  initialSidebarComponentUsageKey,
  initialSidebarCollectionId,
}: LibraryProviderProps) => {
  const [collectionId, setCollectionId] = useState(collectionIdProp);
  const [sidebarBodyComponent, setSidebarBodyComponent] = useState<SidebarBodyComponentId | null>(null);
  const [sidebarComponentUsageKey, setSidebarComponentUsageKey] = useState<string | undefined>(
    initialSidebarComponentUsageKey,
  );
  const [sidebarCollectionId, setSidebarCollectionId] = useState<string | undefined>(initialSidebarCollectionId);
  const [isLibraryTeamModalOpen, openLibraryTeamModal, closeLibraryTeamModal] = useToggle(false);
  const [isCreateCollectionModalOpen, openCreateCollectionModal, closeCreateCollectionModal] = useToggle(false);
  const [componentBeingEdited, openComponentEditor] = useState<string | undefined>();
  const closeComponentEditor = useCallback(() => openComponentEditor(undefined), []);

  const [selectedComponents, setSelectedComponents] = useState<SelectedComponent[]>([]);

  const resetSidebar = useCallback(() => {
    setSidebarComponentUsageKey(undefined);
    setSidebarCollectionId(undefined);
    setSidebarBodyComponent(null);
  }, []);

  const closeLibrarySidebar = useCallback(() => {
    resetSidebar();
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

  const addComponentToSelectedComponents = useCallback<ComponentSelectedEvent>((
    selectedComponent: SelectedComponent,
  ) => {
    setSelectedComponents((prevSelectedComponents) => {
      if (prevSelectedComponents.some((component) => component.usageKey === selectedComponent.usageKey)) {
        return prevSelectedComponents;
      }
      return [...prevSelectedComponents, selectedComponent];
    });
  }, []);

  const removeComponentFromSelectedComponents = useCallback<ComponentSelectedEvent>((
    selectedComponent: SelectedComponent,
  ) => {
    setSelectedComponents((prevSelectedComponents) => {
      if (!prevSelectedComponents.some((component) => component.usageKey === selectedComponent.usageKey)) {
        return prevSelectedComponents;
      }
      return prevSelectedComponents.filter((component) => component.usageKey !== selectedComponent.usageKey);
    });
  }, []);

  const { data: libraryData, isLoading: isLoadingLibraryData } = useContentLibrary(libraryId);

  const readOnly = !!componentPickerMode || !libraryData?.canEditLibrary;

  const context = useMemo<LibraryContextData>(() => {
    const contextValue = {
      libraryId,
      libraryData,
      collectionId,
      setCollectionId,
      readOnly,
      isLoadingLibraryData,
      sidebarBodyComponent,
      closeLibrarySidebar,
      openAddContentSidebar,
      openInfoSidebar,
      openComponentInfoSidebar,
      sidebarComponentUsageKey,
      isLibraryTeamModalOpen,
      openLibraryTeamModal,
      closeLibraryTeamModal,
      isCreateCollectionModalOpen,
      openCreateCollectionModal,
      closeCreateCollectionModal,
      openCollectionInfoSidebar,
      sidebarCollectionId,
      componentBeingEdited,
      openComponentEditor,
      closeComponentEditor,
    };
    if (componentPickerMode === 'single') {
      return {
        ...contextValue,
        componentPickerMode,
        onComponentSelected,
      };
    }
    if (componentPickerMode === 'multiple') {
      return {
        ...contextValue,
        componentPickerMode,
        selectedComponents,
        addComponentToSelectedComponents,
        removeComponentFromSelectedComponents,
      };
    }
    return contextValue;
  }, [
    libraryId,
    collectionId,
    setCollectionId,
    libraryData,
    readOnly,
    isLoadingLibraryData,
    componentPickerMode,
    onComponentSelected,
    addComponentToSelectedComponents,
    removeComponentFromSelectedComponents,
    selectedComponents,
    sidebarBodyComponent,
    closeLibrarySidebar,
    openAddContentSidebar,
    openInfoSidebar,
    openComponentInfoSidebar,
    sidebarComponentUsageKey,
    isLibraryTeamModalOpen,
    openLibraryTeamModal,
    closeLibraryTeamModal,
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
