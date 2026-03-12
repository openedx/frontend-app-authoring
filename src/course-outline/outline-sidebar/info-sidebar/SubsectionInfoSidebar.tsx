import { useState } from 'react';
import { isEmpty } from 'lodash';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Tab, Tabs } from '@openedx/paragon';
import { useNavigate } from 'react-router-dom';

import { getItemIcon } from '@src/generic/block-type-utils';
import { SidebarTitle } from '@src/generic/sidebar';
import { useCourseItemData } from '@src/course-outline/data/apiHooks';
import Loading from '@src/generic/Loading';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { useOutlineSidebarContext } from '@src/course-outline/outline-sidebar/OutlineSidebarContext';
import { getLibraryId } from '@src/generic/key-utils';
import { possibleSubsectionMoves } from '@src/course-outline/drag-helper/utils';

import { InfoSection } from './InfoSection';
import { PublishButon } from './PublishButon';
import messages from '../messages';

interface Props {
  subsectionId: string;
  index?: number;
  sectionIndex?: number;
}

export const SubsectionSidebar = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'info' | 'settings'>('info');
  const { clearSelection, selectedContainerState, setSelectedContainerState } = useOutlineSidebarContext();
  const { subsectionId = '', index, sectionIndex } = selectedContainerState ?? {};
  const { data: subsectionData, isLoading } = useCourseItemData(subsectionId);
  const {
    openPublishModal,
    handleDuplicateSubsectionSubmit,
    sections,
    updateSubsectionOrderByIndex,
    openDeleteModal,
    openUnlinkModal,
  } = useCourseAuthoringContext();

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

  const section = sectionIndex !== undefined ? sections[sectionIndex] : undefined;

  const getPossibleMoves = section ? possibleSubsectionMoves(
    [...sections],
    sectionIndex ?? -1,
    section,
    section.childInfo.children,
  ) : undefined;

  const canMoveSubsection = (oldIndex: number, step: number) => {
    if (getPossibleMoves && section) {
      const moveDetails = getPossibleMoves(oldIndex, step);
      return !isEmpty(moveDetails) && !section.upstreamInfo?.upstreamRef;
    }
    return false;
  };

  const handleMove = (step: number) => {
    if (section && getPossibleMoves && index !== undefined && sectionIndex !== undefined) {
      const moveDetails = getPossibleMoves(index, step);
      updateSubsectionOrderByIndex(section, moveDetails);
      if (!isEmpty(moveDetails)) {
        const newSectionId = moveDetails.sectionId;
        // A subsection can move to a different section (cross-section move)
        const isCrossSection = newSectionId !== section.id;
        const newSectionIndex = isCrossSection
          ? sections.findIndex((s) => s.id === newSectionId)
          : sectionIndex;
        // Cross-section up: goes to end of previous section; cross-section down: goes to start of next section
        const newIndex = isCrossSection
          ? (step === -1 ? sections[newSectionIndex].childInfo.children.length : 0)
          : index + step;
        setSelectedContainerState(selectedContainerState ? {
          ...selectedContainerState,
          sectionId: newSectionId,
          sectionIndex: newSectionIndex,
          index: newIndex,
        } : undefined);
      }
    }
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
          canMoveItem: canMoveSubsection,
          onClickDuplicate: handleDuplicateSubsectionSubmit,
          onClickMoveUp: () => handleMove(-1),
          onClickMoveDown: () => handleMove(1),
          onClickUnlink: () => openUnlinkModal({
            value: subsectionData,
            sectionId: selectedContainerState?.sectionId,
          }),
          onClickDelete: openDeleteModal,
          onClickViewLibrary: () => {
            const upstreamRef = subsectionData?.upstreamInfo?.upstreamRef;
            if (upstreamRef) {
              const libId = getLibraryId(upstreamRef);
              navigate(`/library/${libId}/subsection/${upstreamRef}`);
            }
          },
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
