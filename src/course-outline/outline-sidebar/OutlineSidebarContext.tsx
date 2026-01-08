import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useToggle } from '@openedx/paragon';
import { HelpOutline, Info, Tag } from '@openedx/paragon/icons';

import type { SidebarPage } from '@src/generic/sidebar';
import OutlineHelpSidebar from './OutlineHelpSidebar';
import { OutlineInfoSidebar } from './OutlineInfoSidebar';

import messages from './messages';
import { OutlineAlignSidebar } from './OutlineAlignSidebar';

export type OutlineSidebarPageKeys = 'help' | 'info' | 'align';
export type OutlineSidebarPages = Record<OutlineSidebarPageKeys, SidebarPage>;
export type OutlineSidebarPageProps = Record<string, any>;

interface OutlineSidebarContextData {
  currentPageKey: OutlineSidebarPageKeys;
  currentProps?: OutlineSidebarPageProps;
  setCurrentPageKey: (pageKey: OutlineSidebarPageKeys, props?: OutlineSidebarPageProps) => void;
  isOpen: boolean;
  open: () => void;
  toggle: () => void;
  sidebarPages: OutlineSidebarPages;
}

const OutlineSidebarContext = createContext<OutlineSidebarContextData | undefined>(undefined);

export const OutlineSidebarProvider = ({ children }: { children?: React.ReactNode }) => {
  const intl = useIntl();

  const [currentPageKey, setCurrentPageKeyState] = useState<OutlineSidebarPageKeys>('info');
  const [currentProps, setCurrentPageProps] = useState<OutlineSidebarPageProps>();
  const [isOpen, open, , toggle] = useToggle(true);

  const setCurrentPageKey = useCallback((pageKey: OutlineSidebarPageKeys, props?: OutlineSidebarPageProps) => {
    setCurrentPageKeyState(pageKey);
    setCurrentPageProps(props);
    open();
  }, [open]);

  const sidebarPages = {
    info: {
      component: OutlineInfoSidebar,
      icon: Info,
      title: intl.formatMessage(messages.sidebarButtonInfo),
    },
    align: {
      component: OutlineAlignSidebar,
      icon: Tag,
      title: intl.formatMessage(messages.sidebarButtonAlign),
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
      currentProps,
      setCurrentPageKey,
      sidebarPages,
      isOpen,
      open,
      toggle,
    }),
    [
      currentPageKey,
      currentProps,
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
