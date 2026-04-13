import { useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Tab, Tabs } from '@openedx/paragon';
import { useNavigate } from 'react-router-dom';

import { getItemIcon } from '@src/generic/block-type-utils';

import { SidebarTitle } from '@src/generic/sidebar';

import { useCourseItemData } from '@src/course-outline/data/apiHooks';
import Loading from '@src/generic/Loading';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { useCourseOutlineContext } from '@src/course-outline/CourseOutlineContext';
import { useOutlineSidebarContext } from '@src/course-outline/outline-sidebar/OutlineSidebarContext';
import { getLibraryId } from '@src/generic/key-utils';
import { SectionSettings } from '@src/course-outline/outline-sidebar/info-sidebar/SectionSettings';
import { InfoSection } from './InfoSection';
import messages from '../messages';
import { PublishButon } from './PublishButon';
import { canMoveSection } from '@src/course-outline/drag-helper/utils';

export const SectionSidebar = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'info' | 'settings'>('info');
  const { clearSelection, selectedContainerState, setSelectedContainerState } = useOutlineSidebarContext();
  const { sectionId = '', index } = selectedContainerState ?? {};
  const { data: sectionData, isLoading } = useCourseItemData(sectionId);
  const { openUnlinkModal } = useCourseAuthoringContext();
  const {
    openPublishModal,
    handleDuplicateSectionSubmit,
    sections,
    updateSectionOrderByIndex,
    openDeleteModal,
  } = useCourseOutlineContext();

  const handlePublish = () => {
    if (sectionData?.hasChanges) {
      openPublishModal({
        value: sectionData,
        sectionId: sectionData.id,
      });
    }
  };

  if (isLoading || !sectionData) {
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
        title={sectionData.displayName || ''}
        icon={getItemIcon(sectionData.category || '')}
        onBackBtnClick={clearSelection}
        menuProps={{
          itemId: sectionId,
          index: index ?? -1,
          actions: sectionData.actions || {},
          canMoveItem: canMoveSection(sections),
          onClickDuplicate: handleDuplicateSectionSubmit,
          onClickMoveUp: () => handleMove(-1),
          onClickMoveDown: () => handleMove(1),
          onClickUnlink: () => openUnlinkModal({ value: sectionData, sectionId }),
          onClickDelete: openDeleteModal,
          onClickViewLibrary: () => {
            const upstreamRef = sectionData.upstreamInfo?.upstreamRef;
            if (upstreamRef) {
              const libId = getLibraryId(upstreamRef);
              navigate(`/library/${libId}/section/${upstreamRef}`);
            }
          },
        }}
      />
      {sectionData.hasChanges && <PublishButon onClick={handlePublish} />}
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
        <Tab
          eventKey="settings"
          title={intl.formatMessage(messages.settingsTabText)}
        >
          <SectionSettings key={sectionId} sectionId={sectionId} />
        </Tab>
      </Tabs>
    </>
  );
};
