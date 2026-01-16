import { breakpoints } from '@openedx/paragon';
import { useMediaQuery } from 'react-responsive';

import { Sidebar } from '@src/generic/sidebar';

import OutlineHelpSidebar from './OutlineHelpSidebar';
import { useOutlineSidebarContext } from './OutlineSidebarContext';
import { isOutlineNewDesignEnabled } from '../utils';

const OutlineSideBar = () => {
  const isMedium = useMediaQuery({ maxWidth: breakpoints.medium.maxWidth });

  const {
    currentPageKey,
    setCurrentPageKey,
    isOpen,
    toggle,
    sidebarPages,
  } = useOutlineSidebarContext();

  // Returns the previous help sidebar component if the waffle flag is disabled
  if (!isOutlineNewDesignEnabled()) {
    // On screens smaller than medium, the help sidebar is shown below the course outline
    const colSpan = isMedium ? 'col-12' : 'col-3';
    return (
      <div className={colSpan}>
        <OutlineHelpSidebar />
      </div>
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

export default OutlineSideBar;
