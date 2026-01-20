import { Info } from '@openedx/paragon/icons';
import { SidebarPage } from '@src/generic/sidebar';
import messages from './messages';
import { UnitInfoSidebar } from './unit-info/UnitInfoSidebar';

export type UnitSidebarPageKeys = 'info';

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
};
