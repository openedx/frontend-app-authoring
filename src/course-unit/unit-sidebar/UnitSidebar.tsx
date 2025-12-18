import { getConfig } from '@edx/frontend-platform';
import { Sidebar } from '@src/generic/sidebar';
import LegacySidebar, { LegacySidebarProps } from '../legacy-sidebar';
import { useUnitSidebarContext } from './UnitSidebarContext';

export const UnitSidebar = ({
  legacySidebarProps,
}: {
  legacySidebarProps: LegacySidebarProps,
}) => {
  const showNewSidebar = getConfig().ENABLE_UNIT_PAGE_NEW_DESIGN?.toString().toLowerCase() === 'true';

  const {
    currentPageKey,
    setCurrentPageKey,
    isOpen,
    toggle,
    sidebarPages,
  } = useUnitSidebarContext();

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
      contentProps={{}}
    />
  );
};
