import { HelpOutline, Info, Plus } from '@openedx/paragon/icons';
import type { SidebarPage } from '@src/generic/sidebar';
import OutlineHelpSidebar from './OutlineHelpSidebar';
import { OutlineInfoSidebar } from './OutlineInfoSidebar';
import messages from './messages';
import { AddSidebar } from './AddSidebar';
import type { OutlineSidebarPageKeys } from './OutlineSidebarContext';

export type OutlineSidebarPages = Record<OutlineSidebarPageKeys, SidebarPage>;

export const OUTLINE_SIDEBAR_PAGES: OutlineSidebarPages = {
  info: {
    component: OutlineInfoSidebar,
    icon: Info,
    title: messages.sidebarButtonInfo,
  },
  help: {
    component: OutlineHelpSidebar,
    icon: HelpOutline,
    title: messages.sidebarButtonHelp,
  },
  add: {
    component: AddSidebar,
    icon: Plus,
    title: messages.sidebarButtonAdd,
    hideFromActionMenu: true,
  },
};
