import { createContext, useContext, useMemo } from 'react';
import {
  Info, Plus,
} from '@openedx/paragon/icons';

import type { SidebarPage } from '@src/generic/sidebar';

import { UnitInfoSidebar } from './unit-info/UnitInfoSidebar';
import { AddSidebar } from './AddSidebar';
import messages from './messages';
import { useUnitSidebarContext } from './UnitSidebarContext';

export type UnitSidebarPages = {
  info: SidebarPage;
  align?: SidebarPage;
  add?: SidebarPage;
};

const getUnitSidebarPages = (readOnly: boolean) => ({
  info: {
    component: UnitInfoSidebar,
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
});

/**
 * Context for the Unit Sidebar Pages.
 *
 * This could be used in plugins to add new pages to the sidebar.
 *
 * @example
 *
 * ```tsx
 * export function UnitOutlineSidebarWrapper(
 *   { component, pluginProps }: { component: React.ReactNode, pluginProps: UnitOutlineAspectsPageProps},
 * ) {
 *   const sidebarPages = useUnitSidebarPagesContext();
 *   const AnalyticsPage = useCallback(() => <UnitOutlineAspectsPage {...pluginProps} />, [pluginProps]);
 *
 *   const overridedPages = useMemo(() => ({
 *     ...sidebarPages,
 *     analytics: {
 *       component: AnalyticsPage,
 *       icon: AutoGraph,
 *       title: messages.analyticsLabel,
 *     },
 *   }), [sidebarPages, AnalyticsPage]);
 *
 *   return (
 *     <UnitSidebarPagesContext.Provider value={overridedPages}>
 *       {component}
 *     </UnitSidebarPagesContext.Provider>
 *   );
 * }
 */
export const UnitSidebarPagesContext = createContext<UnitSidebarPages | undefined>(undefined);

type UnitSidebarPagesProviderProps = {
  children: React.ReactNode;
};

export const UnitSidebarPagesProvider = ({ children }: UnitSidebarPagesProviderProps) => {
  const { readOnly } = useUnitSidebarContext();

  const sidebarPages = useMemo(() => getUnitSidebarPages(readOnly), [readOnly]);

  return (
    <UnitSidebarPagesContext.Provider value={sidebarPages}>
      {children}
    </UnitSidebarPagesContext.Provider>
  );
};

export const useUnitSidebarPagesContext = (): UnitSidebarPages => {
  const ctx = useContext(UnitSidebarPagesContext);
  if (ctx === undefined) { throw new Error('useUnitSidebarPages must be used within an UnitSidebarPagesProvider'); }
  return ctx;
};
