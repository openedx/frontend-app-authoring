import { Sidebar } from '@src/generic/sidebar';

import LegacySidebar, { LegacySidebarProps } from '../legacy-sidebar';
import { isUnitPageNewDesignEnabled } from '../utils';
import { UnitSidebarPageKeys, useUnitSidebarContext } from './UnitSidebarContext';
import { useUnitSidebarPagesContext } from './UnitSidebarPagesContext';

export type UnitSidebarProps = {
  legacySidebarProps: LegacySidebarProps,
};

/**
 * Main component of the Sidebar for the Unit
 */
export const UnitSidebar = ({
  legacySidebarProps, // Can be deleted when the legacy sidebar is deprecated
}: UnitSidebarProps) => {
  const {
    currentPageKey,
    setCurrentPageKey,
    setCurrentTabKey,
    isOpen,
    toggle,
  } = useUnitSidebarContext();

  const sidebarPages = useUnitSidebarPagesContext();

  if (!isUnitPageNewDesignEnabled()) {
    return (
      <LegacySidebar {...legacySidebarProps} />
    );
  }

  const handleChangePage = (key: UnitSidebarPageKeys) => {
    // Resets the tab key
    setCurrentTabKey(undefined);
    // Change the page
    setCurrentPageKey(key);
  };

  return (
    <Sidebar
      pages={sidebarPages}
      currentPageKey={currentPageKey}
      setCurrentPageKey={handleChangePage}
      isOpen={isOpen}
      toggle={toggle}
    />
  );
};
