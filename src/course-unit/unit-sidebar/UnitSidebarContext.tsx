import {
  createContext, useCallback, useContext, useMemo, useState,
} from 'react';
import { SidebarPage } from '@src/generic/sidebar';
import { useToggle } from '@openedx/paragon';
import { XBlock } from '../legacy-sidebar';

export type UnitSidebarPageKeys = 'info';
export type UnitSidebarPages = Record<UnitSidebarPageKeys, SidebarPage>;

interface UnitSidebarContextData {
  currentPageKey: UnitSidebarPageKeys;
  setCurrentPageKey: (pageKey: UnitSidebarPageKeys) => void;
  isOpen: boolean;
  open: () => void;
  toggle: () => void;
  title: string;
  childrenBlocks: XBlock[];
}

interface UnitSidebarProviderProps {
  children?: React.ReactNode;
  title?: string;
  childrenBlocks?: XBlock[];
}

const UnitSidebarContext = createContext<UnitSidebarContextData | undefined>(undefined);

export const UnitSidebarProvider = ({
  children,
  title = '',
  childrenBlocks = [],
}: UnitSidebarProviderProps) => {
  const [currentPageKey, setCurrentPageKeyState] = useState<UnitSidebarPageKeys>('info');
  const [isOpen, open,, toggle] = useToggle(true);

  const setCurrentPageKey = useCallback((pageKey: UnitSidebarPageKeys) => {
    setCurrentPageKeyState(pageKey);
    open();
  }, [open]);

  const context = useMemo<UnitSidebarContextData>(
    () => ({
      currentPageKey,
      setCurrentPageKey,
      isOpen,
      open,
      toggle,
      title,
      childrenBlocks,
    }),
    [
      currentPageKey,
      setCurrentPageKey,
      isOpen,
      open,
      toggle,
      title,
      childrenBlocks,
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
