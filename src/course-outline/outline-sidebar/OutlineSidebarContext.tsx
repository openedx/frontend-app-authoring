import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useToggle } from '@openedx/paragon';
import {
  HelpOutline, Info, Tag, Plus,
} from '@openedx/paragon/icons';

import type { SidebarPage } from '@src/generic/sidebar';
import OutlineHelpSidebar from './OutlineHelpSidebar';
import { OutlineInfoSidebar } from './OutlineInfoSidebar';

import messages from './messages';
import { OutlineAlignSidebar } from './OutlineAlignSidebar';
import { AddSidebar } from './AddSidebar';
import { isOutlineNewDesignEnabled } from '../utils';

export type OutlineSidebarPageKeys = 'help' | 'info' | 'align' | 'add';
export type OutlineSidebarPages = {
  info: SidebarPage;
  help: SidebarPage;
  add: SidebarPage;
  align?: SidebarPage;
};
export type OutlineSidebarPageProps = Record<string, any>;

interface OutlineSidebarContextData {
  currentPageKey: OutlineSidebarPageKeys;
  setCurrentPageKey: (pageKey: OutlineSidebarPageKeys, currentContainerId?: string) => void;
  isOpen: boolean;
  open: () => void;
  toggle: () => void;
  sidebarPages: OutlineSidebarPages;
  // The Id of the container when is selected
  selectedContainerId?: string;
  // The Id of the container used in the current sidebar page
  // The container is not necessarily selected to open a selected sidebar.
  // Example: Align sidebar
  currentContainerId?: string;
  openContainerInfoSidebar: (containerId: string) => void;
}

const OutlineSidebarContext = createContext<OutlineSidebarContextData | undefined>(undefined);

export const OutlineSidebarProvider = ({ children }: { children?: React.ReactNode }) => {
  const intl = useIntl();

  const [currentPageKey, setCurrentPageKeyState] = useState<OutlineSidebarPageKeys>('info');
  const [currentContainerId, setCurrentContainerId] = useState<string>();
  const [isOpen, open, , toggle] = useToggle(true);

  const [selectedContainerId, setSelectedContainerId] = useState<string | undefined>();

  const openContainerInfoSidebar = useCallback((containerId: string) => {
    if (isOutlineNewDesignEnabled()) {
      setSelectedContainerId(containerId);
    }
  }, [setSelectedContainerId]);

  const setCurrentPageKey = useCallback((pageKey: OutlineSidebarPageKeys, containerId?: string) => {
    setCurrentPageKeyState(pageKey);
    setCurrentContainerId(containerId);
    open();
  }, [open]);

  const showAlignSidebar = getConfig().ENABLE_TAGGING_TAXONOMY_PAGES === 'true';

  const sidebarPages = {
    info: {
      component: OutlineInfoSidebar,
      icon: Info,
      title: intl.formatMessage(messages.sidebarButtonInfo),
    },
    ...(showAlignSidebar && {
      align: {
        component: OutlineAlignSidebar,
        icon: Tag,
        title: intl.formatMessage(messages.sidebarButtonAlign),
      },
    }),
    help: {
      component: OutlineHelpSidebar,
      icon: HelpOutline,
      title: intl.formatMessage(messages.sidebarButtonHelp),
    },
    add: {
      component: AddSidebar,
      icon: Plus,
      title: intl.formatMessage(messages.sidebarButtonAdd),
      hideFromActionMenu: true,
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
      selectedContainerId,
      currentContainerId,
      openContainerInfoSidebar,
    }),
    [
      currentPageKey,
      setCurrentPageKey,
      sidebarPages,
      isOpen,
      open,
      toggle,
      selectedContainerId,
      currentContainerId,
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
