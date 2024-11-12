import { useToggle } from '@openedx/paragon';
import React, {
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import type { ComponentPickerModal } from '../component-picker';
import type { ContentLibrary } from '../data/api';
import { useContentLibrary } from '../data/apiHooks';

export interface SelectedComponent {
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
  restrictToLibrary?: never;
  /** The component picker modal to use. We need to pass it as a reference instead of
   * directly importing it to avoid the import cycle:
   * ComponentPickerModal > ComponentPicker > LibraryAuthoringPage/LibraryCollectionPage >
   * Sidebar > AddContentContainer > ComponentPickerModal */
  componentPickerModal?: typeof ComponentPickerModal;
};

type ComponentPickerSingleType = {
  componentPickerMode: 'single';
  onComponentSelected: ComponentSelectedEvent;
  selectedComponents?: never;
  addComponentToSelectedComponents?: never;
  removeComponentFromSelectedComponents?: never;
  restrictToLibrary: boolean;
  componentPickerModal?: never;
};

type ComponentPickerMultipleType = {
  componentPickerMode: 'multiple';
  onComponentSelected?: never;
  selectedComponents: SelectedComponent[];
  addComponentToSelectedComponents: ComponentSelectedEvent;
  removeComponentFromSelectedComponents: ComponentSelectedEvent;
  restrictToLibrary: boolean;
  componentPickerModal?: never;
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
  restrictToLibrary?: never;
  componentPickerModal?: typeof ComponentPickerModal;
};

export type ComponentPickerSingleProps = {
  componentPickerMode: 'single';
  onComponentSelected: ComponentSelectedEvent;
  onChangeComponentSelection?: never;
  restrictToLibrary?: boolean;
  componentPickerModal?: never;
};

export type ComponentPickerMultipleProps = {
  componentPickerMode: 'multiple';
  onComponentSelected?: never;
  onChangeComponentSelection?: ComponentSelectionChangedEvent;
  restrictToLibrary?: boolean;
  componentPickerModal?: never;
};

type ComponentPickerProps = NoComponentPickerProps | ComponentPickerSingleProps | ComponentPickerMultipleProps;

type LibraryProviderProps = {
  children?: React.ReactNode;
  libraryId: string;
  /** The initial collection ID to show */
  collectionId?: string;
  showOnlyPublished?: boolean;
  /** Only used for testing */
  initialSidebarComponentInfo?: SidebarComponentInfo;
  componentPickerModal?: typeof ComponentPickerModal;
} & ComponentPickerProps;

/**
 * React component to provide `LibraryContext`
 */
export const LibraryProvider = ({
  children,
  libraryId,
  collectionId: collectionIdProp,
  componentPickerMode,
  restrictToLibrary = false,
  onComponentSelected,
  onChangeComponentSelection,
  showOnlyPublished = false,
  initialSidebarComponentInfo,
  componentPickerModal,
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
    };
    if (!componentPickerMode) {
      return {
        ...contextValue,
        componentPickerModal,
      };
    }
    if (componentPickerMode === 'single') {
      return {
        ...contextValue,
        componentPickerMode,
        restrictToLibrary,
        onComponentSelected,
      };
    }
    if (componentPickerMode === 'multiple') {
      return {
        ...contextValue,
        componentPickerMode,
        restrictToLibrary,
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
    showOnlyPublished,
    componentPickerMode,
    restrictToLibrary,
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
    componentPickerModal,
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
