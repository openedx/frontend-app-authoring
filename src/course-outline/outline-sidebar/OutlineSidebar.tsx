import { Sidebar } from '@src/generic/sidebar';

import { useOutlineSidebarContext } from './OutlineSidebarContext';
import { useOutlineSidebarPagesContext } from './OutlineSidebarPagesContext';

const OutlineSideBar = () => {
  const {
    currentPageKey,
    setCurrentPageKey,
    isOpen,
    toggle,
  } = useOutlineSidebarContext();

  const sidebarPages = useOutlineSidebarPagesContext();

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

export default OutlineSideBar;
