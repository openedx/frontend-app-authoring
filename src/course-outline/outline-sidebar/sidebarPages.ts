import { getConfig } from '@edx/frontend-platform';
import {
  HelpOutline, Info, Plus, Tag,
} from '@openedx/paragon/icons';
import type { SidebarPage } from '@src/generic/sidebar';
import OutlineHelpSidebar from './OutlineHelpSidebar';
import { OutlineInfoSidebar } from './OutlineInfoSidebar';
import messages from './messages';
import { AddSidebar } from './AddSidebar';
import { OutlineAlignSidebar } from './OutlineAlignSidebar';

export type OutlineSidebarPages = {
  info: SidebarPage;
  help: SidebarPage;
  add: SidebarPage;
  align?: SidebarPage;
};

export const getOutlineSidebarPages = (): OutlineSidebarPages => {
  const showAlignSidebar = getConfig().ENABLE_TAGGING_TAXONOMY_PAGES === 'true';
  return {
    info: {
      component: OutlineInfoSidebar,
      icon: Info,
      title: messages.sidebarButtonInfo,
    },
    add: {
      component: AddSidebar,
      icon: Plus,
      title: messages.sidebarButtonAdd,
    },
    ...(showAlignSidebar && {
      align: {
        component: OutlineAlignSidebar,
        icon: Tag,
        title: messages.sidebarButtonAlign,
      },
    }),
    help: {
      component: OutlineHelpSidebar,
      icon: HelpOutline,
      title: messages.sidebarButtonHelp,
    },
  } satisfies OutlineSidebarPages;
};
