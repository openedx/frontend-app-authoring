import { Sidebar } from '@src/generic/sidebar';
import LegacySidebar, { LegacySidebarProps } from '../legacy-sidebar';
import { UnitSidebarPageKeys, useUnitSidebarContext } from './UnitSidebarContext';
import { isUnitPageNewDesignEnabled } from '../utils';
import { UNIT_SIDEBAR_PAGES } from './constants';

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
      pages={UNIT_SIDEBAR_PAGES}
      currentPageKey={currentPageKey}
      setCurrentPageKey={handleChangePage}
      isOpen={isOpen}
      toggle={toggle}
    />
  );
};
