import {
  createContext, useCallback, useContext, useMemo, useState,
} from 'react';
import { SidebarPage } from '@src/generic/sidebar';
import { useToggle } from '@openedx/paragon';
import { useStateWithUrlSearchParam } from '@src/hooks';

export type UnitSidebarPageKeys = 'info' | 'add' | 'align';
export type UnitSidebarPages = Record<UnitSidebarPageKeys, SidebarPage>;

interface UnitSidebarContextData {
  currentPageKey: UnitSidebarPageKeys;
  setCurrentPageKey: (pageKey: UnitSidebarPageKeys, componentId?: string | null) => void;
  currentTabKey?: string;
  setCurrentTabKey: (tabKey: string | undefined) => void;
  selectedComponentId?: string;
  isOpen: boolean;
  open: () => void;
  toggle: () => void;
  readOnly: boolean;
}

const UnitSidebarContext = createContext<UnitSidebarContextData | undefined>(undefined);

export const UnitSidebarProvider = ({
  children,
  readOnly,
}: {
  children?: React.ReactNode,
  readOnly: boolean,
}) => {
  const [currentPageKey, setCurrentPageKeyState] = useStateWithUrlSearchParam<UnitSidebarPageKeys>(
    'info',
    'sidebar',
    (value: string) => value as UnitSidebarPageKeys,
    (value: UnitSidebarPageKeys) => value,
  );
  const [currentTabKey, setCurrentTabKey] = useState<string>();
  const [selectedComponentId, setSelectedComponentId] = useState<string>();
  const [isOpen, open,, toggle] = useToggle(true);

  const setCurrentPageKey = useCallback(/* istanbul ignore next */ (
    pageKey: UnitSidebarPageKeys,
    componentId?: string | null,
  ) => {
    // Reset tab
    setCurrentTabKey(undefined);
    setCurrentPageKeyState(pageKey);
    if (componentId !== undefined) {
      setSelectedComponentId(componentId === null ? undefined : componentId);
    }
    open();
  }, [open]);

  const context = useMemo<UnitSidebarContextData>(
    () => ({
      currentPageKey,
      setCurrentPageKey,
      currentTabKey,
      setCurrentTabKey,
      selectedComponentId,
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
      selectedComponentId,
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
