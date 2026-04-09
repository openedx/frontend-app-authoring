import { useEffect } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Tab, Tabs } from '@openedx/paragon';

import { getItemIcon } from '@src/generic/block-type-utils';

import { SidebarTitle } from '@src/generic/sidebar';

import { useCourseItemData } from '@src/course-outline/data/apiHooks';
import Loading from '@src/generic/Loading';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { useOutlineSidebarContext } from '@src/course-outline/outline-sidebar/OutlineSidebarContext';
import { InfoSection } from './InfoSection';
import { PublishButon } from './PublishButon';
import messages from '../messages';

interface Props {
  subsectionId: string;
}

export const SubsectionSidebar = ({ subsectionId }: Props) => {
  const intl = useIntl();
  const { data: subsectionData, isLoading } = useCourseItemData(subsectionId);
  const { selectedContainerState } = useOutlineSidebarContext();
  const { openPublishModal } = useCourseAuthoringContext();
  const { clearSelection, currentTabKey, setCurrentTabKey } = useOutlineSidebarContext();
  const availableTabs = {
    info: 'info',
    settings: 'settings',
  };

  useEffect(() => {
    if (!currentTabKey || !Object.values(availableTabs).includes(currentTabKey)) {
      // Set default Tab key
      setCurrentTabKey('info');
    }
  }, [currentTabKey, setCurrentTabKey]);

  const handlePublish = () => {
    if (selectedContainerState?.sectionId && subsectionData?.hasChanges) {
      openPublishModal({
        value: subsectionData,
        sectionId: selectedContainerState?.sectionId,
      });
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <SidebarTitle
        title={subsectionData?.displayName || ''}
        icon={getItemIcon(subsectionData?.category || '')}
        onBackBtnClick={clearSelection}
      />
      {subsectionData?.hasChanges && <PublishButon onClick={handlePublish} />}
      <Tabs
        variant="tabs"
        className="my-2 mx-n3.5"
        id="add-content-tabs"
        activeKey={currentTabKey}
        onSelect={setCurrentTabKey}
        mountOnEnter
      >
        <Tab eventKey={availableTabs.info} title={intl.formatMessage(messages.infoTabText)}>
          <InfoSection itemId={subsectionId} />
        </Tab>
        <Tab eventKey={availableTabs.settings} title={intl.formatMessage(messages.settingsTabText)}>
          <div>Settings</div>
        </Tab>
      </Tabs>
    </>
  );
};
