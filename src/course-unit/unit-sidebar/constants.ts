import { Info, Plus } from '@openedx/paragon/icons';
import { SidebarPage } from '@src/generic/sidebar';
import messages from './messages';
import { UnitInfoSidebar } from './unit-info/UnitInfoSidebar';
import { AddSidebar } from './AddSidebar';

export type UnitSidebarPageKeys = 'info' | 'add';

/**
 * Sidebar pages for the unit sidebar
 *
 * This has been separated from the context to avoid a cyclical import
 * if you want to use the context in the sidebar pages.
 */
export const UNIT_SIDEBAR_PAGES: Record<UnitSidebarPageKeys, SidebarPage> = {
  info: {
    component: UnitInfoSidebar,
    icon: Info,
    title: messages.sidebarButtonInfo,
  },
  add: {
    component: AddSidebar,
    icon: Plus,
    title: messages.sidebarButtonAdd,
  },
};
