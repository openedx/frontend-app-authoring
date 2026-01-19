import {
  createContext, useCallback, useContext, useMemo, useState,
} from 'react';
import { SidebarPage } from '@src/generic/sidebar';
import { useToggle } from '@openedx/paragon';

export type UnitSidebarPageKeys = 'info';
export type UnitSidebarPages = Record<UnitSidebarPageKeys, SidebarPage>;

interface UnitSidebarContextData {
  currentPageKey: UnitSidebarPageKeys;
  setCurrentPageKey: (pageKey: UnitSidebarPageKeys) => void;
  currentTabKey?: string;
  setCurrentTabKey: (tabKey: string) => void;
  isOpen: boolean;
  open: () => void;
  toggle: () => void;
}

const UnitSidebarContext = createContext<UnitSidebarContextData | undefined>(undefined);

export const UnitSidebarProvider = ({ children }: { children?: React.ReactNode }) => {
  const [currentPageKey, setCurrentPageKeyState] = useState<UnitSidebarPageKeys>('info');
  const [currentTabKey, setCurrentTabKey] = useState<string>();
  const [isOpen, open,, toggle] = useToggle(true);

  const setCurrentPageKey = useCallback((pageKey: UnitSidebarPageKeys) => {
    setCurrentPageKeyState(pageKey);
    open();
  }, [open]);

  const context = useMemo<UnitSidebarContextData>(
    () => ({
      currentPageKey,
      setCurrentPageKey,
      currentTabKey,
      setCurrentTabKey,
      isOpen,
      open,
      toggle,
    }),
    [
      currentPageKey,
      setCurrentPageKey,
      currentTabKey,
      setCurrentTabKey,
      isOpen,
      open,
      toggle,
    ],
  );

  return (
    <UnitSidebarContext.Provider value={context}>
      {children}
    </UnitSidebarContext.Provider>
  );
};

export function useUnitSidebarContext(): UnitSidebarContextData {
  const ctx = useContext(UnitSidebarContext);
  if (ctx === undefined) {
    /* istanbul ignore next */
    throw new Error('useUnitSidebarContext() was used in a component without a <UnitSidebarProvider> ancestor.');
  }
  return ctx;
}
