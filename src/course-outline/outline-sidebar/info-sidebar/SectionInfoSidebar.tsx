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
import messages from '../messages';
import { PublishButon } from './PublishButon';

interface Props {
  sectionId: string;
}

export const SectionSidebar = ({ sectionId }: Props) => {
  const intl = useIntl();
  const { data: sectionData, isLoading } = useCourseItemData(sectionId);
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
    if (sectionData?.hasChanges) {
      openPublishModal({
        value: sectionData,
        sectionId: sectionData.id,
      });
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <SidebarTitle
        title={sectionData?.displayName || ''}
        icon={getItemIcon(sectionData?.category || '')}
        onBackBtnClick={clearSelection}
      />
      {sectionData?.hasChanges && <PublishButon onClick={handlePublish} />}
      <Tabs
        variant="tabs"
        className="my-2 mx-n3.5"
        id="add-content-tabs"
        activeKey={currentTabKey}
        onSelect={setCurrentTabKey}
        mountOnEnter
      >
        <Tab eventKey={availableTabs.info} title={intl.formatMessage(messages.infoTabText)}>
          <InfoSection itemId={sectionId} />
        </Tab>
        <Tab eventKey={availableTabs.settings} title={intl.formatMessage(messages.settingsTabText)}>
          <div>Settings</div>
        </Tab>
      </Tabs>
    </>
  );
};
