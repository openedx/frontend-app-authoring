import { useState } from 'react';
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
  index?: number;
}

export const SubsectionSidebar = ({ subsectionId, index }: Props) => {
  const intl = useIntl();
  const [tab, setTab] = useState<'info' | 'settings'>('info');
  const { data: subsectionData, isLoading } = useCourseItemData(subsectionId);
  const { selectedContainerState } = useOutlineSidebarContext();
  const {
    openPublishModal,
    handleDuplicateSubsectionSubmit,
  } = useCourseAuthoringContext();
  const { clearSelection } = useOutlineSidebarContext();

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
        menuProps={{
          itemId: subsectionId,
          index: index ?? -1,
          onClickDuplicate: handleDuplicateSubsectionSubmit,
          onClickMoveUp: () => {},
          onClickMoveDown: () => {},
          onClickUnlink: () => {},
          onClickDelete: () => {},
          onClickViewLibrary: () => {},
        }}
      />
      {subsectionData?.hasChanges && <PublishButon onClick={handlePublish} />}
      <Tabs
        variant="tabs"
        className="my-2 mx-n3.5"
        id="add-content-tabs"
        activeKey={tab}
        onSelect={setTab}
        mountOnEnter
      >
        <Tab eventKey="info" title={intl.formatMessage(messages.infoTabText)}>
          <InfoSection itemId={subsectionId} />
        </Tab>
        <Tab eventKey="settings" title={intl.formatMessage(messages.settingsTabText)}>
          <div>Settings</div>
        </Tab>
      </Tabs>
    </>
  );
};
