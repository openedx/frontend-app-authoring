import { getConfig } from '@edx/frontend-platform';
import { Sidebar } from '@src/generic/sidebar';
import LegacySidebar, { LegacySidebarProps } from '../legacy-sidebar';
import { useUnitSidebarContext } from './UnitSidebarContext';
import { useUnitSidebarPages } from './unitSidebarPages';

export type UnitSidebarProps = {
  legacySidebarProps: LegacySidebarProps,
};

export const UnitSidebar = ({
  legacySidebarProps, // Can be deleted when the legacy sidebar is deprecated
}: UnitSidebarProps) => {
  const showNewSidebar = getConfig().ENABLE_UNIT_PAGE_NEW_DESIGN?.toString().toLowerCase() === 'true';

  const {
    currentPageKey,
    setCurrentPageKey,
    isOpen,
    toggle,
  } = useUnitSidebarContext();

  const sidebarPages = useUnitSidebarPages();

  if (!showNewSidebar) {
    return (
      <LegacySidebar {...legacySidebarProps} />
    );
  }

  return (
    <Sidebar
      pages={sidebarPages}
      currentPageKey={currentPageKey}
      setCurrentPageKey={setCurrentPageKey}
      isOpen={isOpen}
      toggle={toggle}
    />
  );
};
