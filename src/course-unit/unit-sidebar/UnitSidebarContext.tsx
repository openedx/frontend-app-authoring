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
  setCurrentPageKey: (pageKey: UnitSidebarPageKeys, componentId?: string) => void;
  currentTabKey?: string;
  setCurrentTabKey: (tabKey: string | undefined) => void;
  // The Id of the component used in the current sidebar page
  // The component is not necessarily selected to open a selected sidebar.
  // Example: Align sidebar
  currentComponentId?: string;
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
  const [currentComponentId, setCurrentComponentId] = useState<string>();
  const [isOpen, open,, toggle] = useToggle(true);

  const setCurrentPageKey = useCallback(/* istanbul ignore next */ (
    pageKey: UnitSidebarPageKeys,
    componentId?: string,
  ) => {
    setCurrentTabKey(undefined);
    setCurrentPageKeyState(pageKey);
    setCurrentComponentId(componentId);
    open();
  }, [open]);

  const context = useMemo<UnitSidebarContextData>(
    () => ({
      currentPageKey,
      setCurrentPageKey,
      currentTabKey,
      setCurrentTabKey,
      currentComponentId,
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
      currentComponentId,
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
