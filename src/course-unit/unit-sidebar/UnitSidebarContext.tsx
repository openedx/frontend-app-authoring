import {
  createContext, useCallback, useContext, useMemo, useState,
} from 'react';
import { SidebarPage } from '@src/generic/sidebar';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useToggle } from '@openedx/paragon';
import { Info } from '@openedx/paragon/icons';
import messages from './messages';
import { UnitInfoSidebar } from './UnitInfoSidebar';

export type UnitSidebarPageKeys = 'info';
export type UnitSidebarPages = Record<UnitSidebarPageKeys, SidebarPage>;

interface UnitSidebarContextData {
  currentPageKey: UnitSidebarPageKeys;
  setCurrentPageKey: (pageKey: UnitSidebarPageKeys) => void;
  isOpen: boolean;
  open: () => void;
  toggle: () => void;
  sidebarPages: UnitSidebarPages;
}

const UnitSidebarContext = createContext<UnitSidebarContextData | undefined>(undefined);

export const UnitSidebarProvider = ({ children }: { children?: React.ReactNode }) => {
  const intl = useIntl();

  const [currentPageKey, setCurrentPageKeyState] = useState<UnitSidebarPageKeys>('info');
  const [isOpen, open, toggle] = useToggle(true);

  const setCurrentPageKey = useCallback((pageKey: UnitSidebarPageKeys) => {
    setCurrentPageKeyState(pageKey);
    open();
  }, [open]);

  const sidebarPages = {
    info: {
      component: UnitInfoSidebar,
      icon: Info,
      title: intl.formatMessage(messages.sidebarButtonInfo),
    },
  } satisfies UnitSidebarPages;

  const context = useMemo<UnitSidebarContextData>(
    () => ({
      currentPageKey,
      setCurrentPageKey,
      sidebarPages,
      isOpen,
      open,
      toggle,
    }),
    [
      currentPageKey,
      setCurrentPageKey,
      sidebarPages,
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
