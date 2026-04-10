import { Sidebar } from '@src/generic/sidebar';

import { UnitSidebarPageKeys, useUnitSidebarContext } from './UnitSidebarContext';
import { useUnitSidebarPagesContext } from './UnitSidebarPagesContext';

/**
 * Main component of the Sidebar for the Unit
 */
export const UnitSidebar = () => {
  const {
    currentPageKey,
    setCurrentPageKey,
    setCurrentTabKey,
    isOpen,
    toggle,
  } = useUnitSidebarContext();

  const sidebarPages = useUnitSidebarPagesContext();

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
