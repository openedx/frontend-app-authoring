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
export type ComponentSelectionChangedEvent = (selectedComponents: SelectedComponent[]) => void;

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

export interface SidebarComponentInfo {
  type: SidebarBodyComponentId;
  id: string;
  /** Additional action on Sidebar display */
  additionalAction?: SidebarAdditionalActions;
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
  onChangeComponentSelection?: never;
};

export type ComponentPickerSingleProps = {
  componentPickerMode: 'single';
  onComponentSelected: ComponentSelectedEvent;
  onChangeComponentSelection?: never;
};

export type ComponentPickerMultipleProps = {
  componentPickerMode: 'multiple';
  onComponentSelected?: never;
  onChangeComponentSelection?: ComponentSelectionChangedEvent;
};

type ComponentPickerProps = NoComponentPickerProps | ComponentPickerSingleProps | ComponentPickerMultipleProps;

type LibraryProviderProps = {
  children?: React.ReactNode;
  libraryId: string;
  /** The initial collection ID to show */
  collectionId?: string;
  /** Only used for testing */
  initialSidebarComponentInfo?: SidebarComponentInfo;
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
  onChangeComponentSelection,
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

  const [selectedComponents, setSelectedComponents] = useState<SelectedComponent[]>([]);

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

  const addComponentToSelectedComponents = useCallback<ComponentSelectedEvent>((
    selectedComponent: SelectedComponent,
  ) => {
    setSelectedComponents((prevSelectedComponents) => {
      // istanbul ignore if: this should never happen
      if (prevSelectedComponents.some((component) => component.usageKey === selectedComponent.usageKey)) {
        return prevSelectedComponents;
      }
      const newSelectedComponents = [...prevSelectedComponents, selectedComponent];
      onChangeComponentSelection?.(newSelectedComponents);
      return newSelectedComponents;
    });
  }, []);

  const removeComponentFromSelectedComponents = useCallback<ComponentSelectedEvent>((
    selectedComponent: SelectedComponent,
  ) => {
    setSelectedComponents((prevSelectedComponents) => {
      // istanbul ignore if: this should never happen
      if (!prevSelectedComponents.some((component) => component.usageKey === selectedComponent.usageKey)) {
        return prevSelectedComponents;
      }
      const newSelectedComponents = prevSelectedComponents.filter(
        (component) => component.usageKey !== selectedComponent.usageKey,
      );
      onChangeComponentSelection?.(newSelectedComponents);
      return newSelectedComponents;
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
    onChangeComponentSelection,
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
