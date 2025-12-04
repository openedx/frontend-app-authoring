import { useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  IconButton,
  IconButtonToggle,
  Stack,
  breakpoints,
  useToggle,
} from '@openedx/paragon';
import {
  FormatIndentDecrease,
  FormatIndentIncrease,
  HelpOutline,
  Info,
} from '@openedx/paragon/icons';
import { useMediaQuery } from 'react-responsive';

import { useWaffleFlags } from '@src/data/apiHooks';

import OutlineHelpSidebar from './OutlineHelpSidebar';
import { OutlineInfoSidebar } from './OutlineInfoSidebar';
import messages from './messages';

interface OutlineSideBarProps {
  courseId: string;
}

const COMPONENTS = {
  help: OutlineHelpSidebar,
  info: OutlineInfoSidebar,
};

const OutlineSideBar = ({ courseId }: OutlineSideBarProps) => {
  const intl = useIntl();
  const { tempWaffleFlag } = useWaffleFlags();
  const [isOpen, open, , toggle] = useToggle(true);
  const [currentTab, setCurrentTab] = useState('info');
  const isMedium = useMediaQuery({ maxWidth: breakpoints.medium.maxWidth });

  // Returns the previous help sidebar component if the waffle flag is disabled
  if (!tempWaffleFlag) {
    // On screens smaller than medium, the help sidebar is shown below the course outline
    const colSpan = isMedium ? 'col-12' : 'col-3';
    return (
      <div className={colSpan}>
        <OutlineHelpSidebar courseId={courseId} />
      </div>
    );
  }

  const SidebarComponent = COMPONENTS[currentTab];

  const onChangeIconButtonToggle = (value: string) => {
    setCurrentTab(value);
    open();
  };

  return (
    <Stack direction="horizontal" className="align-items-baseline mx-3">
      {isOpen && !!currentTab && (
        <div className="mw-300px px-3 bg-white">
          <SidebarComponent courseId={courseId} />
        </div>
      )}
      <div className="sidebar-toggle">
        <IconButton src={isOpen ? FormatIndentIncrease : FormatIndentDecrease} alt="Close" onClick={toggle} />
        <IconButtonToggle
          activeValue={currentTab}
          onChange={onChangeIconButtonToggle}
        >
          <IconButton value="info" src={Info} alt={intl.formatMessage(messages.sidebarButtonInfo)} />
          <IconButton value="help" src={HelpOutline} alt={intl.formatMessage(messages.sidebarButtonHelp)} />
        </IconButtonToggle>
      </div>
    </Stack>
  );
};

export default OutlineSideBar;
