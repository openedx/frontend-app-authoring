import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useToggle } from '@openedx/paragon';
import { HelpOutline, Info, Plus } from '@openedx/paragon/icons';

import type { SidebarPage } from '@src/generic/sidebar';
import OutlineHelpSidebar from './OutlineHelpSidebar';
import { OutlineInfoSidebar } from './OutlineInfoSidebar';

import messages from './messages';
import { AddSidebar } from './AddSidebar';
import { isOutlineNewDesignEnabled } from '../utils';
import { useStateWithUrlSearchParam } from '@src/hooks';

export type OutlineSidebarPageKeys = 'help' | 'info' | 'add';
export type OutlineSidebarPages = Record<OutlineSidebarPageKeys, SidebarPage>;
export type OutlineFlowType = 'use-section' | 'use-subsection' | 'use-unit' | null;
export type OutlineFlow = {
  flowType: OutlineFlowType;
  parentLocator: string;
}

interface OutlineSidebarContextData {
  currentPageKey: OutlineSidebarPageKeys;
  setCurrentPageKey: (pageKey: OutlineSidebarPageKeys) => void;
  currentFlow: OutlineFlow | null;
  startCurrentFlow: (flow: OutlineFlow) => void;
  stopCurrentFlow: () => void;
  isOpen: boolean;
  open: () => void;
  toggle: () => void;
  sidebarPages: OutlineSidebarPages;
  selectedContainerId?: string;
  openContainerInfoSidebar: (containerId: string) => void;
}

const OutlineSidebarContext = createContext<OutlineSidebarContextData | undefined>(undefined);

export const OutlineSidebarProvider = ({ children }: { children?: React.ReactNode }) => {
  const intl = useIntl();

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
    open();
    stopCurrentFlow();
  }, [open, currentFlow, stopCurrentFlow]);

  const startCurrentFlow = useCallback((flow: OutlineFlow) => {
    setCurrentPageKey('add');
    setCurrentFlow(flow);
  }, [setCurrentFlow, setCurrentPageKey]);

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
      currentFlow,
      startCurrentFlow,
      stopCurrentFlow,
      sidebarPages,
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
      sidebarPages,
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
