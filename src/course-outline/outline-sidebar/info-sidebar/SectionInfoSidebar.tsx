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
import messages from '../messages';
import { PublishButon } from './PublishButon';
import { canMoveSection } from '@src/course-outline/drag-helper/utils';

interface Props {
  sectionId: string;
  index?: number; 
}

export const SectionSidebar = ({ sectionId, index }: Props) => {
  const intl = useIntl();
  const [tab, setTab] = useState<'info' | 'settings'>('info');
  const { data: sectionData, isLoading } = useCourseItemData(sectionId);
  const {
    openPublishModal,
    handleDuplicateSectionSubmit,
    sections,
    updateSectionOrderByIndex,
  } = useCourseAuthoringContext();
  const { clearSelection } = useOutlineSidebarContext();

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

  const handleMoveUp = () => {
    if (index) {
      updateSectionOrderByIndex(index, index - 1);
    }
  }

  const handleMoveDown = () => {
    if (index) {
      updateSectionOrderByIndex(index, index + 1);
    }
  }

  return (
    <>
      <SidebarTitle
        title={sectionData?.displayName || ''}
        icon={getItemIcon(sectionData?.category || '')}
        onBackBtnClick={clearSelection}
        menuProps={{
          itemId: sectionId,
          index: index ?? -1,
          canMoveItem: canMoveSection(sections),
          onClickDuplicate: handleDuplicateSectionSubmit,
          onClickMoveUp: handleMoveUp,
          onClickMoveDown: handleMoveDown,
          onClickUnlink: () => {},
          onClickDelete: () => {},
          onClickViewLibrary: () => {},
        }}
      />
      {sectionData?.hasChanges && <PublishButon onClick={handlePublish} />}
      <Tabs
        variant="tabs"
        className="my-2 mx-n3.5"
        id="add-content-tabs"
        activeKey={tab}
        onSelect={setTab}
        mountOnEnter
      >
        <Tab eventKey="info" title={intl.formatMessage(messages.infoTabText)}>
          <InfoSection itemId={sectionId} />
        </Tab>
        <Tab eventKey="settings" title={intl.formatMessage(messages.settingsTabText)}>
          <div>Settings</div>
        </Tab>
      </Tabs>
    </>
  );
};
