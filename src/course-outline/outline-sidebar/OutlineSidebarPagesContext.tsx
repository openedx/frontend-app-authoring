import { createContext, useContext } from 'react';
import { getConfig } from '@edx/frontend-platform';
import {
  HelpOutline, Info, Plus, Tag,
} from '@openedx/paragon/icons';

import type { SidebarPage } from '@src/generic/sidebar';

import { AddSidebar } from './AddSidebar';
import { OutlineAlignSidebar } from './OutlineAlignSidebar';
import OutlineHelpSidebar from './OutlineHelpSidebar';
import { OutlineInfoSidebar } from './OutlineInfoSidebar';
import messages from './messages';

export type OutlineSidebarPages = {
  info: SidebarPage;
  help: SidebarPage;
  add: SidebarPage;
  align?: SidebarPage;
};

const showAlignSidebar = getConfig().ENABLE_TAGGING_TAXONOMY_PAGES === 'true';

const OUTLINE_SIDEBAR_PAGES: OutlineSidebarPages = {
  info: {
    component: OutlineInfoSidebar,
    icon: Info,
    title: messages.sidebarButtonInfo,
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
  add: {
    component: AddSidebar,
    icon: Plus,
    title: messages.sidebarButtonAdd,
  },
};

/**
 * Context for the Outline Sidebar Pages.
 *
 * This could be used in plugins to add new pages to the sidebar.
 *
 * @example
 *
 * ```tsx
 * export function CourseOutlineSidebarWrapper(
 *   { component, pluginProps }: { component: React.ReactNode, pluginProps: CourseOutlineAspectsPageProps },
 * ) {
 *  const sidebarPages = useOutlineSidebarPagesContext();
 *
 *  const AnalyticsPage = React.useCallback(() => <CourseOutlineAspectsPage {...pluginProps} />, [pluginProps]);
 *
 *  const overridedPages = useMemo(() => ({
 *    ...sidebarPages,
 *    analytics: {
 *      component: AnalyticsPage,
 *      icon: AutoGraph,
 *      title: messages.analyticsLabel,
 *    },
 *  }), [sidebarPages, AnalyticsPage]);
 *
 *  return (
 *    <OutlineSidebarPagesContext.Provider value={overridedPages}>
 *      {component}
 *    </OutlineSidebarPagesContext.Provider>
 *  );
 *}
 */
export const OutlineSidebarPagesContext = createContext<OutlineSidebarPages>(OUTLINE_SIDEBAR_PAGES);

export const useOutlineSidebarPagesContext = (): OutlineSidebarPages => useContext(OutlineSidebarPagesContext);
