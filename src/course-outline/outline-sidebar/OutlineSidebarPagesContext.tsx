import { createContext, useContext, useMemo } from 'react';
import { getConfig } from '@edx/frontend-platform';
import {
  HelpOutline, Info, Plus, Tag,
} from '@openedx/paragon/icons';

import type { SidebarPage } from '@src/generic/sidebar';

import { AddSidebar } from './AddSidebar';
import { OutlineAlignSidebar } from './OutlineAlignSidebar';
import OutlineHelpSidebar from './OutlineHelpSidebar';
import { InfoSidebar } from './info-sidebar/InfoSidebar';
import messages from './messages';

export type OutlineSidebarPages = {
  info: SidebarPage;
  help: SidebarPage;
  add: SidebarPage;
  align?: SidebarPage;
};

const getOutlineSidebarPages = () => ({
  info: {
    component: InfoSidebar,
    icon: Info,
    title: messages.sidebarButtonInfo,
  },
  add: {
    component: AddSidebar,
    icon: Plus,
    title: messages.sidebarButtonAdd,
  },
  ...(getConfig().ENABLE_TAGGING_TAXONOMY_PAGES === 'true' && {
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
});

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
 *   const AnalyticsPage = React.useCallback(() => <CourseOutlineAspectsPage {...pluginProps} />, [pluginProps]);
 *   const sidebarPages = useOutlineSidebarPagesContext();
 *
 *   const overridedPages = useMemo(() => ({
 *     ...sidebarPages,
 *     analytics: {
 *       component: AnalyticsPage,
 *       icon: AutoGraph,
 *        title: messages.analyticsLabel,
 *     },
 *   }), [sidebarPages, AnalyticsPage]);
 *
 *   return (
 *     <OutlineSidebarPagesContext.Provider value={overridedPages}>
 *       {component}
 *     </OutlineSidebarPagesContext.Provider>
 *   );
 * }
 */
export const OutlineSidebarPagesContext = createContext<OutlineSidebarPages | undefined>(undefined);

type OutlineSidebarPagesProviderProps = {
  children: React.ReactNode;
};

export const OutlineSidebarPagesProvider = ({ children }: OutlineSidebarPagesProviderProps) => {
  // align page is sometimes not added when getOutlineSidebarPages() is called at the top level.
  // So if we call it inside the hook, getConfig has updated values and align page is added.
  const sidebarPages = useMemo(getOutlineSidebarPages, []);

  return (
    <OutlineSidebarPagesContext.Provider value={sidebarPages}>
      {children}
    </OutlineSidebarPagesContext.Provider>
  );
};

export const useOutlineSidebarPagesContext = (): OutlineSidebarPages => {
  const ctx = useContext(OutlineSidebarPagesContext);
  // istanbul ignore if: this should never happen
  if (ctx === undefined) { throw new Error('useOutlineSidebarPages must be used within an OutlineSidebarPagesProvider'); }
  return ctx;
};
