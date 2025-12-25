import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useToggle } from '@openedx/paragon';
import { HelpOutline, Info } from '@openedx/paragon/icons';

import type { SidebarPage } from '@src/generic/sidebar';
import OutlineHelpSidebar from './OutlineHelpSidebar';
import { OutlineInfoSidebar } from './OutlineInfoSidebar';

import messages from './messages';

export type OutlineSidebarPageKeys = 'help' | 'info';
export type OutlineSidebarPages = Record<OutlineSidebarPageKeys, SidebarPage>;

interface OutlineSidebarContextData {
  currentPageKey: OutlineSidebarPageKeys;
  setCurrentPageKey: (pageKey: OutlineSidebarPageKeys) => void;
  isOpen: boolean;
  open: () => void;
  toggle: () => void;
  sidebarPages: OutlineSidebarPages;
}

const OutlineSidebarContext = createContext<OutlineSidebarContextData | undefined>(undefined);

export const OutlineSidebarProvider = ({ children }: { children?: React.ReactNode }) => {
  const intl = useIntl();

  const [currentPageKey, setCurrentPageKeyState] = useState<OutlineSidebarPageKeys>('info');
  const [isOpen, open, , toggle] = useToggle(true);

  const setCurrentPageKey = useCallback((pageKey: OutlineSidebarPageKeys) => {
    setCurrentPageKeyState(pageKey);
    open();
  }, [open]);

  const sidebarPages = {
    info: {
      component: OutlineInfoSidebar,
      icon: Info,
      title: intl.formatMessage(messages.sidebarButtonInfo),
    },
    help: {
      component: OutlineHelpSidebar,
      icon: HelpOutline,
      title: intl.formatMessage(messages.sidebarButtonHelp),
    },
  } satisfies OutlineSidebarPages;

  const context = useMemo<OutlineSidebarContextData>(
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
