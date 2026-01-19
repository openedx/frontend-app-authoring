import { Sidebar } from '@src/generic/sidebar';
import LegacySidebar, { LegacySidebarProps } from '../legacy-sidebar';
import { useUnitSidebarContext } from './UnitSidebarContext';
import { useUnitSidebarPages } from './unitSidebarPages';
import { isUnitPageNewDesignEnabled } from '../utils';

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

  const sidebarPages = useUnitSidebarPages();

  if (!isUnitPageNewDesignEnabled()) {
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
