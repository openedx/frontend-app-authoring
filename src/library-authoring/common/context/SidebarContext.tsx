import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useParams } from 'react-router-dom';
import { useStateWithUrlSearchParam } from '@src/hooks';
import { LibQueryParamKeys, useLibraryRoutes } from '@src/library-authoring/routes';
import { useComponentPickerContext } from './ComponentPickerContext';
import { useLibraryContext } from './LibraryContext';

export enum SidebarBodyItemId {
  AddContent = 'add-content',
  Info = 'info',
  ComponentInfo = 'component-info',
  CollectionInfo = 'collection-info',
  ContainerInfo = 'container-info',
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
  Usage: 'usage',
  Details: 'details',
} as const;
export type ComponentInfoTab = typeof COMPONENT_INFO_TABS[keyof typeof COMPONENT_INFO_TABS];
export const isComponentInfoTab = (tab: string): tab is ComponentInfoTab => (
  Object.values<string>(COMPONENT_INFO_TABS).includes(tab)
);

export const CONTAINER_INFO_TABS = {
  Preview: 'preview',
  Manage: 'manage',
  Usage: 'usage',
  Settings: 'settings',
} as const;
export type ContainerInfoTab = typeof CONTAINER_INFO_TABS[keyof typeof CONTAINER_INFO_TABS];
export const isContainerInfoTab = (tab: string): tab is ContainerInfoTab => (
  Object.values<string>(CONTAINER_INFO_TABS).includes(tab)
);

const DEFAULT_TAB = {
  component: COMPONENT_INFO_TABS.Preview,
  container: CONTAINER_INFO_TABS.Preview,
  collection: COLLECTION_INFO_TABS.Manage,
};

type SidebarInfoTab = ComponentInfoTab | CollectionInfoTab | ContainerInfoTab;
const toSidebarInfoTab = (tab: string): SidebarInfoTab | undefined => (
  isComponentInfoTab(tab) || isCollectionInfoTab(tab) || isContainerInfoTab(tab)
    ? tab : undefined
);

export interface DefaultTabs {
  component: ComponentInfoTab;
  container: ContainerInfoTab;
  collection: CollectionInfoTab;
}

export interface SidebarItemInfo {
  type: SidebarBodyItemId;
  id: string;
  index?: number;
}

export enum SidebarActions {
  JumpToManageCollections = 'jump-to-manage-collections',
  JumpToManageTags = 'jump-to-manage-tags',
  ManageTeam = 'manage-team',
  None = '',
}

export type SidebarContextData = {
  closeLibrarySidebar: () => void;
  openAddContentSidebar: () => void;
  openLibrarySidebar: () => void;
  openCollectionInfoSidebar: (collectionId: string) => void;
  openComponentInfoSidebar: (usageKey: string) => void;
  openContainerInfoSidebar: (usageKey: string) => void;
  openItemSidebar: (selectedItemId: string, type: SidebarBodyItemId, index?: number) => void;
  sidebarItemInfo?: SidebarItemInfo;
  sidebarAction: SidebarActions;
  setSidebarAction: (action: SidebarActions) => void;
  resetSidebarAction: () => void;
  sidebarTab: SidebarInfoTab;
  setSidebarTab: (tab: SidebarInfoTab) => void;
  defaultTab: DefaultTabs;
  hiddenTabs: Array<SidebarInfoTab>;
};

/**
 * Sidebar Context.
 *
 * Get this using `useSidebarContext()`
 *
 */
const SidebarContext = createContext<SidebarContextData | undefined>(undefined);

type SidebarProviderProps = {
  children?: React.ReactNode;
  /** Only used for testing */
  initialSidebarItemInfo?: SidebarItemInfo;
};

/**
 * React component to provide `SidebarContext`
 */
export const SidebarProvider = ({
  children,
  initialSidebarItemInfo,
}: SidebarProviderProps) => {
  const [sidebarItemInfo, setSidebarItemInfo] = useState<SidebarItemInfo | undefined>(
    initialSidebarItemInfo,
  );

  const [defaultTab, setDefaultTab] = useState<DefaultTabs>(DEFAULT_TAB);
  const [hiddenTabs, setHiddenTabs] = useState<Array<SidebarInfoTab>>([]);

  const [sidebarTab, setSidebarTab] = useStateWithUrlSearchParam<SidebarInfoTab>(
    defaultTab.component,
    LibQueryParamKeys.SidebarTab,
    (value: string) => toSidebarInfoTab(value),
    (value: SidebarInfoTab) => value.toString(),
  );

  const [sidebarAction, setSidebarAction] = useStateWithUrlSearchParam<SidebarActions>(
    SidebarActions.None,
    LibQueryParamKeys.SidebarActions,
    (value: string) => Object.values(SidebarActions).find((enumValue) => value === enumValue),
    (value: SidebarActions) => value.toString(),
  );
  const resetSidebarAction = useCallback(() => {
    setSidebarAction(SidebarActions.None);
  }, [setSidebarAction]);

  const closeLibrarySidebar = useCallback(() => {
    setSidebarItemInfo(undefined);
  }, []);
  const openAddContentSidebar = useCallback(() => {
    setSidebarItemInfo({ id: '', type: SidebarBodyItemId.AddContent });
  }, []);
  const openLibrarySidebar = useCallback(() => {
    setSidebarItemInfo({ id: '', type: SidebarBodyItemId.Info });
  }, []);

  const openComponentInfoSidebar = useCallback((usageKey: string, index?: number) => {
    setSidebarItemInfo({
      id: usageKey,
      type: SidebarBodyItemId.ComponentInfo,
      index,
    });
  }, []);

  const openCollectionInfoSidebar = useCallback((newCollectionId: string, index?: number) => {
    setSidebarItemInfo({
      id: newCollectionId,
      type: SidebarBodyItemId.CollectionInfo,
      index,
    });
  }, []);

  const openContainerInfoSidebar = useCallback((usageKey: string, index?: number) => {
    setSidebarItemInfo({
      id: usageKey,
      type: SidebarBodyItemId.ContainerInfo,
      index,
    });
  }, []);

  const { navigateTo } = useLibraryRoutes();
  const openItemSidebar = useCallback((selectedItemId: string, type: SidebarBodyItemId, index?: number) => {
    navigateTo({ selectedItemId, index });
    setSidebarItemInfo({ id: selectedItemId, type, index });
  }, [navigateTo, setSidebarItemInfo]);

  // Set the initial sidebar state based on the URL parameters and context.
  const { selectedItemId, index: indexParam } = useParams();
  const { collectionId, containerId } = useLibraryContext();
  const { componentPickerMode } = useComponentPickerContext();

  useEffect(() => {
    if (initialSidebarItemInfo) {
      // If the sidebar is already open with a selected item, we don't need to do anything.
      return;
    }
    if (componentPickerMode) {
      // If we are in component picker mode, we should not open the sidebar automatically.
      return;
    }

    // Handle selected item id changes
    if (selectedItemId) {
      // if a item is selected that means we have list of items displayed
      // which means we can get the index from url and set it.
      const indexNumber = indexParam ? Number(indexParam) : undefined;
      if (selectedItemId.startsWith('lct:')) {
        openContainerInfoSidebar(selectedItemId, indexNumber);
      } else if (selectedItemId.startsWith('lb:')) {
        openComponentInfoSidebar(selectedItemId, indexNumber);
      } else {
        openCollectionInfoSidebar(selectedItemId, indexNumber);
      }
    } else if (collectionId) {
      openCollectionInfoSidebar(collectionId);
    } else if (containerId) {
      openContainerInfoSidebar(containerId);
    } else {
      openLibrarySidebar();
    }
  }, [selectedItemId, collectionId, containerId]);

  useEffect(() => {
    // Hide the Preview tab (and replace Preview as the default tab) on the container page when:
    // * the sidebar is showing the current container, OR
    // * the sidebar is showing a selected component.
    // We do this to avoid duplicating content between the
    // Section/Subsection main pages and the container sidebar.
    if (containerId && (!selectedItemId || selectedItemId.startsWith('lb:'))) {
      setDefaultTab({
        collection: COLLECTION_INFO_TABS.Details,
        component: COMPONENT_INFO_TABS.Manage,
        container: CONTAINER_INFO_TABS.Manage,
      });
      setHiddenTabs([
        COMPONENT_INFO_TABS.Preview,
        CONTAINER_INFO_TABS.Preview,
      ]);
    } else {
      setDefaultTab(DEFAULT_TAB);
      setHiddenTabs([]);
    }
  }, [selectedItemId, containerId]);

  const context = useMemo<SidebarContextData>(() => {
    const contextValue = {
      closeLibrarySidebar,
      openAddContentSidebar,
      openLibrarySidebar,
      openComponentInfoSidebar,
      sidebarItemInfo,
      openCollectionInfoSidebar,
      openContainerInfoSidebar,
      openItemSidebar,
      sidebarAction,
      setSidebarAction,
      resetSidebarAction,
      sidebarTab,
      setSidebarTab,
      defaultTab,
      hiddenTabs,
    };

    return contextValue;
  }, [
    closeLibrarySidebar,
    openAddContentSidebar,
    openLibrarySidebar,
    openComponentInfoSidebar,
    sidebarItemInfo,
    openCollectionInfoSidebar,
    openContainerInfoSidebar,
    openItemSidebar,
    sidebarAction,
    setSidebarAction,
    resetSidebarAction,
    sidebarTab,
    setSidebarTab,
    defaultTab,
    hiddenTabs,
  ]);

  return (
    <SidebarContext.Provider value={context}>
      {children}
    </SidebarContext.Provider>
  );
};

export function useSidebarContext(): SidebarContextData {
  const ctx = useContext(SidebarContext);
  if (ctx === undefined) {
    /* istanbul ignore next */
    return {
      closeLibrarySidebar: () => {},
      openAddContentSidebar: () => {},
      openLibrarySidebar: () => {},
      openComponentInfoSidebar: () => {},
      openCollectionInfoSidebar: () => {},
      openContainerInfoSidebar: () => {},
      openItemSidebar: () => {},
      sidebarAction: SidebarActions.None,
      setSidebarAction: () => {},
      resetSidebarAction: () => {},
      sidebarTab: COMPONENT_INFO_TABS.Preview,
      setSidebarTab: () => {},
      sidebarItemInfo: undefined,
      defaultTab: DEFAULT_TAB,
      hiddenTabs: [],
    };
  }
  return ctx;
}
