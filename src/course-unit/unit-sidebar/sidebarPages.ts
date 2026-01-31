import { getConfig } from '@edx/frontend-platform';
import { Info, Tag } from '@openedx/paragon/icons';
import { SidebarPage } from '@src/generic/sidebar';
import messages from './messages';
import { UnitInfoSidebar } from './unit-info/UnitInfoSidebar';
import { UnitAlignSidebar } from './UnitAlignSidebar';

export type UnitSidebarPages = {
  info: SidebarPage;
  align?: SidebarPage;
};

/**
 * Sidebar pages for the unit sidebar
 *
 * This has been separated from the context to avoid a cyclical import
 * if you want to use the context in the sidebar pages.
 */
export const getUnitSidebarPages = (): UnitSidebarPages => {
  const showAlignSidebar = getConfig().ENABLE_TAGGING_TAXONOMY_PAGES === 'true';
  return {
    info: {
      component: UnitInfoSidebar,
      icon: Info,
      title: messages.sidebarButtonInfo,
    },
    ...(showAlignSidebar && {
      align: {
        component: UnitAlignSidebar,
        icon: Tag,
        title: messages.sidebarButtonAlign,
      },
    }),
  }
};
