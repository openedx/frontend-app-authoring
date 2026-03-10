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

export const SectionSidebar = () => {
  const intl = useIntl();
  const [tab, setTab] = useState<'info' | 'settings'>('info');
  const { clearSelection, selectedContainerState, setSelectedContainerState } = useOutlineSidebarContext();
  const { sectionId = '', index } = selectedContainerState ?? {};
  const { data: sectionData, isLoading } = useCourseItemData(sectionId);
  const {
    openPublishModal,
    handleDuplicateSectionSubmit,
    sections,
    updateSectionOrderByIndex,
  } = useCourseAuthoringContext();

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

  const handleMove = (step: number) => {
    if (index !== undefined) {
      updateSectionOrderByIndex(index, index + step);
      setSelectedContainerState(selectedContainerState ? { ...selectedContainerState, index: index + step } : undefined);
    }
  };

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
          onClickMoveUp: () => handleMove(-1),
          onClickMoveDown: () => handleMove(1),
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
