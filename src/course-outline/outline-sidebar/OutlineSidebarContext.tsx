import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useToggle } from '@openedx/paragon';

import { useEscapeClick, useStateWithUrlSearchParam } from '@src/hooks';
import { isOutlineNewDesignEnabled } from '../utils';

export type OutlineSidebarPageKeys = 'help' | 'info' | 'add' | 'align';
export type OutlineFlowType = 'use-section' | 'use-subsection' | 'use-unit' | null;
export type OutlineFlow = {
  flowType: 'use-section';
  parentLocator?: string;
  parentTitle?: string;
} | {
  flowType: OutlineFlowType;
  parentLocator: string;
  parentTitle: string;
};

interface OutlineSidebarContextData {
  currentPageKey: OutlineSidebarPageKeys;
  setCurrentPageKey: (pageKey: OutlineSidebarPageKeys, containerId?: string) => void;
  currentFlow: OutlineFlow | null;
  startCurrentFlow: (flow: OutlineFlow) => void;
  stopCurrentFlow: () => void;
  isOpen: boolean;
  open: () => void;
  toggle: () => void;
  selectedContainerId?: string;
  selectedSectionId?: string;
  // The Id of the container used in the current sidebar page
  // The container is not necessarily selected to open a selected sidebar.
  // Example: Align sidebar
  currentContainerId?: string;
  openContainerInfoSidebar: (containerId: string) => void;
}

const OutlineSidebarContext = createContext<OutlineSidebarContextData | undefined>(undefined);

export const OutlineSidebarProvider = ({ children }: { children?: React.ReactNode }) => {
  const [currentContainerId, setCurrentContainerId] = useState<string>();
  const [currentPageKey, setCurrentPageKeyState] = useStateWithUrlSearchParam<OutlineSidebarPageKeys>(
    'info',
    'sidebar',
    (value: string) => value as OutlineSidebarPageKeys,
    (value: OutlineSidebarPageKeys) => value,
  );
  const [currentFlow, setCurrentFlow] = useState<OutlineFlow | null>(null);
  const [isOpen, open, , toggle] = useToggle(true);

  const [selectedSectionId, setSelectedSectionId] = useState<string | undefined>();
  const [selectedContainerId, setSelectedContainerId] = useState<string | undefined>();

  /**
  * Stops current add content flow.
  * This will cause the sidebar to switch back to its normal state and clear out any placeholder containers.
  */
  const stopCurrentFlow = useCallback(() => {
    setCurrentFlow(null);
  }, [setCurrentFlow]);

  const setCurrentPageKey = useCallback((pageKey: OutlineSidebarPageKeys, containerId?: string) => {
    setCurrentPageKeyState(pageKey);
    setCurrentFlow(null);
    setCurrentContainerId(containerId);
    open();
  }, [open, setCurrentFlow]);

  const openContainerInfoSidebar = useCallback((containerId: string, sectionId?: string) => {
    if (isOutlineNewDesignEnabled()) {
      setSelectedContainerId(containerId);
      if (sectionId) {
        setSelectedSectionId(sectionId);
      }
      setCurrentPageKey('info');
    }
  }, [setSelectedContainerId, setSelectedSectionId]);

  const clearSelection = useCallback(() => {
    setSelectedSectionId(undefined);
    setSelectedContainerId(undefined);
  }, [setSelectedSectionId, selectedContainerId]);

  /**
  * Starts add content flow.
  * The sidebar enters an add content flow which allows user to add content in a specific container.
  * A placeholder container is added in the location when the flow is started.
  */
  const startCurrentFlow = useCallback((flow: OutlineFlow) => {
    setCurrentPageKey('add');
    setCurrentFlow(flow);
  }, [setCurrentFlow, setCurrentPageKey]);

  useEscapeClick({
    onEscape: () => {
      stopCurrentFlow();
      setSelectedContainerId(undefined);
      setSelectedSectionId(undefined);
    },
    dependency: [stopCurrentFlow, selectedContainerId],
  });

  const context = useMemo<OutlineSidebarContextData>(
    () => ({
      currentPageKey,
      setCurrentPageKey,
      currentFlow,
      startCurrentFlow,
      stopCurrentFlow,
      isOpen,
      open,
      toggle,
      selectedContainerId,
      currentContainerId,
      selectedSectionId,
      openContainerInfoSidebar,
      clearSelection,
    }),
    [
      currentPageKey,
      setCurrentPageKey,
      currentFlow,
      startCurrentFlow,
      stopCurrentFlow,
      isOpen,
      open,
      toggle,
      selectedContainerId,
      currentContainerId,
      selectedSectionId,
      openContainerInfoSidebar,
      clearSelection,
    ],
  );

  return (
    <OutlineSidebarContext.Provider value={context}>
      {children}
    </OutlineSidebarContext.Provider>
  );
};

export function useOutlineSidebarContext(): OutlineSidebarContextData {
  const ctx = useContext(OutlineSidebarContext);
  if (ctx === undefined) {
    /* istanbul ignore next */
    throw new Error('useOutlineSidebarContext() was used in a component without a <OutlineSidebarProvider> ancestor.');
  }
  return ctx;
}
