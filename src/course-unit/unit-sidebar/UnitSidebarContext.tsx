import {
  createContext, useCallback, useContext, useMemo, useState,
} from 'react';
import { SidebarPage } from '@src/generic/sidebar';
import { useToggle } from '@openedx/paragon';

export type UnitSidebarPageKeys = 'info' | 'add';
export type UnitSidebarPages = Record<UnitSidebarPageKeys, SidebarPage>;

interface UnitSidebarContextData {
  currentPageKey: UnitSidebarPageKeys;
  setCurrentPageKey: (pageKey: UnitSidebarPageKeys) => void;
  currentTabKey?: string;
  setCurrentTabKey: (tabKey: string | undefined) => void;
  isOpen: boolean;
  open: () => void;
  toggle: () => void;
  readOnly: boolean;
}

const UnitSidebarContext = createContext<UnitSidebarContextData | undefined>(undefined);

export const UnitSidebarProvider = ({
  children,
  readOnly = false,
}: {
  children?: React.ReactNode,
  readOnly?: boolean,
}) => {
  const [currentPageKey, setCurrentPageKeyState] = useState<UnitSidebarPageKeys>('info');
  const [currentTabKey, setCurrentTabKey] = useState<string>();
  const [isOpen, open,, toggle] = useToggle(true);

  const setCurrentPageKey = useCallback(/* istanbul ignore next */ (pageKey: UnitSidebarPageKeys) => {
    // Reset tab
    setCurrentTabKey(undefined);
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
      readOnly,
    }),
    [
      currentPageKey,
      setCurrentPageKey,
      currentTabKey,
      setCurrentTabKey,
      isOpen,
      open,
      toggle,
      readOnly,
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
