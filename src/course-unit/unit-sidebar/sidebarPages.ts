import { getConfig } from '@edx/frontend-platform';
import { Info, Tag, Plus } from '@openedx/paragon/icons';
import { SidebarPage } from '@src/generic/sidebar';
import messages from './messages';
import { UnitAlignSidebar } from './UnitAlignSidebar';
import { AddSidebar } from './AddSidebar';
import { useUnitSidebarContext } from './UnitSidebarContext';
import { InfoSidebar } from './unit-info/InfoSidebar';

export type UnitSidebarPages = {
  info: SidebarPage;
  align?: SidebarPage;
  add?: SidebarPage;
};

/**
 * Sidebar pages for the unit sidebar
 *
 * This has been separated from the context to avoid a cyclical import
 * if you want to use the context in the sidebar pages.
 */
export const useUnitSidebarPages = (): UnitSidebarPages => {
  const showAlignSidebar = getConfig().ENABLE_TAGGING_TAXONOMY_PAGES === 'true';
  const { readOnly } = useUnitSidebarContext();
  return {
    info: {
      component: InfoSidebar,
      icon: Info,
      title: messages.sidebarButtonInfo,
    },
    ...(!readOnly && {
      add: {
        component: AddSidebar,
        icon: Plus,
        title: messages.sidebarButtonAdd,
      },
    }),
    ...(showAlignSidebar && {
      align: {
        component: UnitAlignSidebar,
        icon: Tag,
        title: messages.sidebarButtonAlign,
      },
    }),
  };
};
