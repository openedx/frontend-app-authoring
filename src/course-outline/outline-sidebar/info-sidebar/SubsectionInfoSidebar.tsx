import { useEffect } from 'react';
import { isEmpty } from 'lodash';

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
import { possibleSubsectionMoves } from '@src/course-outline/drag-helper/utils';
import { XBlock } from '@src/data/types';

import { InfoSection } from './InfoSection';
import { PublishButon } from './PublishButon';
import messages from '../messages';
import { SubsectionSettings } from './SubsectionSettings';

export const SubsectionSidebar = () => {
  const intl = useIntl();
  const navigate = useNavigate();

  const {
    clearSelection,
    currentTabKey,
    setCurrentTabKey,
    selectedContainerState,
    setSelectedContainerState,
    openContainerInfoSidebar,
  } = useOutlineSidebarContext();
  const { subsectionId = '', index } = selectedContainerState ?? {};

  const { data: subsectionData, isLoading } = useCourseItemData(subsectionId);

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
  const { data: section } = useCourseItemData<XBlock>(selectedContainerState?.sectionId);
  const { openUnlinkModal } = useCourseAuthoringContext();
  const {
    openPublishModal,
    handleDuplicateSubsectionSubmit,
    sections,
    updateSubsectionOrderByIndex,
    openDeleteModal,
  } = useCourseOutlineContext();
  const sectionIndex = sections.findIndex((s) => s.id === selectedContainerState?.sectionId);

  const handlePublish = () => {
    if (selectedContainerState?.sectionId && subsectionData?.hasChanges) {
      openPublishModal({
        value: subsectionData,
        sectionId: selectedContainerState?.sectionId,
      });
    }
  };

  if (isLoading || !subsectionData) {
    return <Loading />;
  }

  // re-create actions object for customizations
  const actions = { ...subsectionData.actions };
  actions.deletable = actions.deletable && !section?.upstreamInfo?.upstreamRef;
  actions.duplicable = actions.duplicable && !section?.upstreamInfo?.upstreamRef;

  const getPossibleMoves = section ?
    possibleSubsectionMoves(
      [...sections],
      sectionIndex ?? -1,
      section,
      section.childInfo.children,
    ) :
    undefined;

  const canMoveSubsection = (oldIndex: number, step: number) => {
    if (getPossibleMoves && section) {
      const moveDetails = getPossibleMoves(oldIndex, step);
      return !isEmpty(moveDetails) && !section.upstreamInfo?.upstreamRef;
    }
    // istanbul ignore next
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
        // istanbul ignore next
        const newSectionIndex = isCrossSection
          ? sections.findIndex((s) => s.id === newSectionId)
          : sectionIndex;
        // Cross-section up: goes to end of previous section; cross-section down: goes to start of next section
        // istanbul ignore next
        const newIndex = isCrossSection
          ? (step === -1 ? sections[newSectionIndex].childInfo.children.length : 0)
          : index + step;
        // istanbul ignore next
        setSelectedContainerState(
          selectedContainerState ?
            {
              ...selectedContainerState,
              sectionId: newSectionId,
              index: newIndex,
            } :
            undefined,
        );
      }
    }
  };

  const handleBack = () => {
    if (selectedContainerState?.sectionId) {
      openContainerInfoSidebar(
        selectedContainerState.sectionId,
        undefined,
        selectedContainerState.sectionId,
        sectionIndex >= 0 ? sectionIndex : undefined,
      );
      return;
    }
    clearSelection();
  };

  return (
    <>
      <SidebarTitle
        title={subsectionData?.displayName || ''}
        icon={getItemIcon(subsectionData?.category || '')}
        onBackBtnClick={handleBack}
        menuProps={{
          itemId: subsectionId,
          index: index ?? -1,
          actions,
          canMoveItem: canMoveSubsection,
          onClickDuplicate: handleDuplicateSubsectionSubmit,
          onClickMoveUp: () => handleMove(-1),
          onClickMoveDown: () => handleMove(1),
          onClickUnlink: () =>
            openUnlinkModal({
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
        activeKey={currentTabKey}
        onSelect={setCurrentTabKey}
        mountOnEnter
      >
        <Tab eventKey={availableTabs.info} title={intl.formatMessage(messages.infoTabText)}>
          <InfoSection itemId={subsectionId} />
        </Tab>
        <Tab eventKey={availableTabs.settings} title={intl.formatMessage(messages.settingsTabText)}>
          {/* key is required to reset local state of tab */}
          <SubsectionSettings key={subsectionId} subsectionId={subsectionId} />
        </Tab>
      </Tabs>
    </>
  );
};
