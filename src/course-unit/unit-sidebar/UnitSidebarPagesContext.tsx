import { createContext, useContext, useMemo } from 'react';
import { getConfig } from '@edx/frontend-platform';
import { Info, Plus, Tag } from '@openedx/paragon/icons';

import type { SidebarPage } from '@src/generic/sidebar';

import { InfoSidebar } from './unit-info/InfoSidebar';
import { AddSidebar } from './AddSidebar';
import { UnitAlignSidebar } from './UnitAlignSidebar';
import { useUnitSidebarContext } from './UnitSidebarContext';
import messages from './messages';

export type UnitSidebarPages = {
  info: SidebarPage;
  add?: SidebarPage;
  align?: SidebarPage;
};

const getUnitSidebarPages = (readOnly: boolean, disableAdd: boolean) => {
  const showAlignSidebar = getConfig().ENABLE_TAGGING_TAXONOMY_PAGES === 'true';

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
        disabled: disableAdd,
        tooltip: disableAdd ? messages.sidebarDisabledAddTooltip : undefined,
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
  const {
    readOnly,
    selectedComponentId,
    currentItemCategory,
  } = useUnitSidebarContext();

  const hasComponentSelected = selectedComponentId !== undefined;
  const isSplitTest = currentItemCategory === 'split_test';
  const disableAdd = hasComponentSelected || isSplitTest;

  const sidebarPages = useMemo(
    () => getUnitSidebarPages(readOnly, disableAdd),
    [readOnly, hasComponentSelected],
  );

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
