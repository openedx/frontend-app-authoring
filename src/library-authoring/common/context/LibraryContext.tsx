import { useToggle } from '@openedx/paragon';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useParams } from 'react-router-dom';
import { ContainerType } from '../../../generic/key-utils';

import type { ComponentPicker } from '../../component-picker';
import type { ContentLibrary, BlockTypeMetadata } from '../../data/api';
import { useContentLibrary } from '../../data/apiHooks';
import { useComponentPickerContext } from './ComponentPickerContext';

export interface ComponentEditorInfo {
  usageKey: string;
  blockType?:string
  onClose?: (data?:any) => void;
}

export type LibraryContextData = {
  /** The ID of the current library */
  libraryId: string;
  libraryData?: ContentLibrary;
  readOnly: boolean;
  isLoadingLibraryData: boolean;
  /** The ID of the current collection/container, on the sidebar OR page */
  collectionId: string | undefined;
  setCollectionId: (collectionId?: string) => void;
  containerId: string | undefined;
  setContainerId: (containerId?: string) => void;
  // Only show published components
  showOnlyPublished: boolean;
  // Additional filtering
  extraFilter?: string[];
  // "Create New Collection" modal
  isCreateCollectionModalOpen: boolean;
  openCreateCollectionModal: () => void;
  closeCreateCollectionModal: () => void;
  // "Create new container" modal
  createContainerModalType: ContainerType | undefined;
  setCreateContainerModalType: (containerType?: ContainerType) => void;
  // Editor modal - for editing some component
  /** If the editor is open and the user is editing some component, this is the component being edited. */
  componentBeingEdited: ComponentEditorInfo | undefined;
  /** If an onClose callback is provided, it will be called when the editor is closed. */
  openComponentEditor: (usageKey: string, onClose?: (data?:any) => void, blockType?:string) => void;
  closeComponentEditor: (data?:any) => void;
  componentPicker?: typeof ComponentPicker;
  blockTypesData?: Record<string, BlockTypeMetadata>;
};

/**
 * Library Context.
 * Always available when we're in the context of a single library.
 *
 * Get this using `useLibraryContext()`
 *
 * Not used on the "library list" on Studio home.
 */
const LibraryContext = createContext<LibraryContextData | undefined>(undefined);

type LibraryProviderProps = {
  children?: React.ReactNode;
  libraryId: string;
  showOnlyPublished?: boolean;
  extraFilter?: string[]
  // If set, will initialize the current collection and/or component from the current URL
  skipUrlUpdate?: boolean;

  /** The component picker modal to use. We need to pass it as a reference instead of
   * directly importing it to avoid the import cycle:
   * ComponentPicker > LibraryAuthoringPage/LibraryCollectionPage >
   * Sidebar > AddContent > ComponentPicker */
  componentPicker?: typeof ComponentPicker;
};

/**
 * React component to provide `LibraryContext`
 */
export const LibraryProvider = ({
  children,
  libraryId,
  showOnlyPublished = false,
  extraFilter = [],
  skipUrlUpdate = false,
  componentPicker,
}: LibraryProviderProps) => {
  const [isCreateCollectionModalOpen, openCreateCollectionModal, closeCreateCollectionModal] = useToggle(false);
  const [createContainerModalType, setCreateContainerModalType] = useState<ContainerType | undefined>(undefined);
  const [componentBeingEdited, setComponentBeingEdited] = useState<ComponentEditorInfo | undefined>();
  const closeComponentEditor = useCallback((data) => {
    setComponentBeingEdited((prev) => {
      prev?.onClose?.(data);
      return undefined;
    });
  }, []);
  const openComponentEditor = useCallback((usageKey: string, onClose?: () => void, blockType?:string) => {
    setComponentBeingEdited({ usageKey, onClose, blockType });
  }, []);

  const { data: libraryData, isLoading: isLoadingLibraryData } = useContentLibrary(libraryId);

  const {
    componentPickerMode,
  } = useComponentPickerContext();

  const readOnly = !!componentPickerMode || !libraryData?.canEditLibrary;

  // Parse the initial collectionId and/or container ID(s) from the current URL params
  const params = useParams();
  const {
    collectionId: urlCollectionId,
    containerId: urlContainerId,
  } = params;
  const [collectionId, setCollectionId] = useState(
    skipUrlUpdate ? undefined : urlCollectionId,
  );
  const [containerId, setContainerId] = useState(
    skipUrlUpdate ? undefined : urlContainerId,
  );

  const context = useMemo<LibraryContextData>(() => {
    const contextValue = {
      libraryId,
      libraryData,
      collectionId,
      setCollectionId,
      containerId,
      setContainerId,
      readOnly,
      isLoadingLibraryData,
      showOnlyPublished,
      extraFilter,
      isCreateCollectionModalOpen,
      openCreateCollectionModal,
      closeCreateCollectionModal,
      createContainerModalType,
      setCreateContainerModalType,
      componentBeingEdited,
      openComponentEditor,
      closeComponentEditor,
      componentPicker,
    };

    return contextValue;
  }, [
    libraryId,
    libraryData,
    collectionId,
    setCollectionId,
    containerId,
    setContainerId,
    readOnly,
    isLoadingLibraryData,
    showOnlyPublished,
    extraFilter,
    isCreateCollectionModalOpen,
    openCreateCollectionModal,
    closeCreateCollectionModal,
    componentBeingEdited,
    openComponentEditor,
    closeComponentEditor,
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
