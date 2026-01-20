import { Sidebar } from '@src/generic/sidebar';
import LegacySidebar, { LegacySidebarProps } from '../legacy-sidebar';
import { useUnitSidebarContext } from './UnitSidebarContext';
import { isUnitPageNewDesignEnabled } from '../utils';
import { UNIT_SIDEBAR_PAGES } from './constans';

export type UnitSidebarProps = {
  legacySidebarProps: LegacySidebarProps,
};

export const UnitSidebar = ({
  legacySidebarProps, // Can be deleted when the legacy sidebar is deprecated
}: UnitSidebarProps) => {
  const {
    currentPageKey,
    setCurrentPageKey,
    isOpen,
    toggle,
  } = useUnitSidebarContext();

  if (!isUnitPageNewDesignEnabled()) {
    return (
      <LegacySidebar {...legacySidebarProps} />
    );
  }

  return (
    <Sidebar
      pages={UNIT_SIDEBAR_PAGES}
      currentPageKey={currentPageKey}
      setCurrentPageKey={setCurrentPageKey}
      isOpen={isOpen}
      toggle={toggle}
    />
  );
};
