import { useState } from 'react';
import {
  IconButton,
  IconButtonToggle,
  Stack,
  breakpoints,
} from '@openedx/paragon';
import { Close, Help } from '@openedx/paragon/icons';
import { useMediaQuery } from 'react-responsive';

import { useWaffleFlags } from '@src/data/apiHooks';

import OutlineHelpSidebar from './OutlineHelpSidebar';

interface OutlineSideBarProps {
  courseId: string;
}

const OutlineSideBar = ({ courseId }: OutlineSideBarProps) => {
  const { tempWaffleFlag } = useWaffleFlags();
  const [currentTab, setCurrentTab] = useState('help');
  const isMedium = useMediaQuery({ maxWidth: breakpoints.medium.maxWidth });

  // Returns the previous help sidebar component if the waffle flag is disabled
  if (!tempWaffleFlag) {
    // On screens smaller than medium, the help sidebar is shown below the course outline
    const sizeClass = isMedium ? 'col-12' : 'col-3';
    return (
      <div className={`mx-1 ${sizeClass}`}>
        <OutlineHelpSidebar courseId={courseId} />
      </div>
    );
  }

  return (
    <Stack direction="horizontal" className="align-items-baseline">
      {currentTab === 'help' && (
        <div className="mw-300px">
          <OutlineHelpSidebar courseId={courseId} />
        </div>
      )}
      <div className="sidebar-toggle">
        <IconButtonToggle
          activeValue={currentTab}
          onChange={setCurrentTab}
        >
          { /* @ts-ignore */}
          <IconButton value="clear" src={Close} alt="Close" />
          { /* @ts-ignore */}
          <IconButton value="help" src={Help} alt="Help" />
        </IconButtonToggle>
      </div>
    </Stack>
  );
};

export default OutlineSideBar;
