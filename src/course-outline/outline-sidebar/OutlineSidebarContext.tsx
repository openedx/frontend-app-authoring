import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useToggle } from '@openedx/paragon';

import { useStateWithUrlSearchParam } from '@src/hooks';
import { isOutlineNewDesignEnabled } from '../utils';

export type OutlineSidebarPageKeys = 'help' | 'info' | 'add';
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
  setCurrentPageKey: (pageKey: OutlineSidebarPageKeys) => void;
  currentFlow: OutlineFlow | null;
  startCurrentFlow: (flow: OutlineFlow) => void;
  stopCurrentFlow: () => void;
  isOpen: boolean;
  open: () => void;
  toggle: () => void;
  selectedContainerId?: string;
  openContainerInfoSidebar: (containerId: string) => void;
}

const OutlineSidebarContext = createContext<OutlineSidebarContextData | undefined>(undefined);

export const OutlineSidebarProvider = ({ children }: { children?: React.ReactNode }) => {
  const [currentPageKey, setCurrentPageKeyState] = useStateWithUrlSearchParam<OutlineSidebarPageKeys>(
    'info',
    'sidebar',
    (value: string) => value as OutlineSidebarPageKeys,
    (value: OutlineSidebarPageKeys) => value,
  );
  const [currentFlow, setCurrentFlow] = useState<OutlineFlow | null>(null);
  const [isOpen, open, , toggle] = useToggle(true);

  const [selectedContainerId, setSelectedContainerId] = useState<string | undefined>();

  const openContainerInfoSidebar = useCallback((containerId: string) => {
    if (isOutlineNewDesignEnabled()) {
      setSelectedContainerId(containerId);
    }
  }, [setSelectedContainerId]);

  const stopCurrentFlow = useCallback(() => {
    setCurrentFlow(null);
  }, [setCurrentFlow]);

  const setCurrentPageKey = useCallback((pageKey: OutlineSidebarPageKeys) => {
    setCurrentPageKeyState(pageKey);
    setCurrentFlow(null);
    open();
  }, [open, setCurrentFlow]);

  const startCurrentFlow = useCallback((flow: OutlineFlow) => {
    setCurrentPageKey('add');
    setCurrentFlow(flow);
  }, [setCurrentFlow, setCurrentPageKey]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        stopCurrentFlow();
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

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
      openContainerInfoSidebar,
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
      openContainerInfoSidebar,
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
