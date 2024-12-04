import { useToggle } from '@openedx/paragon';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import type { ComponentPicker } from '../../component-picker';
import type { ContentLibrary } from '../../data/api';
import { useContentLibrary } from '../../data/apiHooks';
import { useComponentPickerContext } from './ComponentPickerContext';

export interface ComponentEditorInfo {
  usageKey: string;
  onClose?: () => void;
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
  // "Library Team" modal
  isLibraryTeamModalOpen: boolean;
  openLibraryTeamModal: () => void;
  closeLibraryTeamModal: () => void;
  // "Create New Collection" modal
  isCreateCollectionModalOpen: boolean;
  openCreateCollectionModal: () => void;
  closeCreateCollectionModal: () => void;
  // Editor modal - for editing some component
  /** If the editor is open and the user is editing some component, this is the component being edited. */
  componentBeingEdited: ComponentEditorInfo | undefined;
  /** If an onClose callback is provided, it will be called when the editor is closed. */
  openComponentEditor: (usageKey: string, onClose?: () => void) => void;
  closeComponentEditor: () => void;
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
const LibraryContext = createContext<LibraryContextData | undefined>(undefined);

type LibraryProviderProps = {
  children?: React.ReactNode;
  libraryId: string;
  /** The initial collection ID to show */
  collectionId?: string;
  showOnlyPublished?: boolean;
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
  componentPicker,
}: LibraryProviderProps) => {
  const [collectionId, setCollectionId] = useState(collectionIdProp);
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
      isLibraryTeamModalOpen,
      openLibraryTeamModal,
      closeLibraryTeamModal,
      isCreateCollectionModalOpen,
      openCreateCollectionModal,
      closeCreateCollectionModal,
      componentBeingEdited,
      openComponentEditor,
      closeComponentEditor,
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
    isLibraryTeamModalOpen,
    openLibraryTeamModal,
    closeLibraryTeamModal,
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
