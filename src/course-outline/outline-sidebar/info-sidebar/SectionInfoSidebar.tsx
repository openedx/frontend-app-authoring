import { useDefaultTab } from '../../../hooks/useDefaultTab';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Tab, Tabs } from '@openedx/paragon';
import { useNavigate } from 'react-router-dom';
import { arrayMove } from '@dnd-kit/sortable';

import { getItemIcon } from '@src/generic/block-type-utils';
import { SidebarTitle } from '@src/generic/sidebar';
import { useCourseItemData, useDuplicateItem } from '@src/course-outline/data/apiHooks';
import { courseIDtoBlockID } from '@src/course-outline/utils';
import Loading from '@src/generic/Loading';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { useCourseOutlineContext } from '@src/course-outline/CourseOutlineContext';
import { useOutlineSidebarContext } from '@src/course-outline/outline-sidebar/OutlineSidebarContext';
import { getLibraryId } from '@src/generic/key-utils';
import { SectionSettings } from '@src/course-outline/outline-sidebar/info-sidebar/SectionSettings';
import { canMoveSection } from '@src/course-outline/drag-helper/utils';

import { InfoSection } from './InfoSection';
import messages from '../messages';
import { PublishButon } from './PublishButon';

export const SectionSidebar = () => {
  const intl = useIntl();
  const navigate = useNavigate();

  const { courseId, openUnlinkModal } = useCourseAuthoringContext();
  const duplicateMutation = useDuplicateItem(courseId);
  const {
    openPublishModal,
    openDeleteModal,
    sections,
    previewSections,
    commitSectionReorder,
  } = useCourseOutlineContext();
  const {
    clearSelection,
    currentTabKey,
    setCurrentTabKey,
    selectedContainerState,
    setSelectedContainerState,
  } = useOutlineSidebarContext();
  const availableTabs = {
    info: 'info',
    settings: 'settings',
  };

  useDefaultTab('section');
  const { sectionId = '', index } = selectedContainerState ?? {};
  const { data: sectionData, isLoading } = useCourseItemData(sectionId);

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
      const nextSections = arrayMove(sections, index, index + step);
      const sectionListIds = nextSections.map((s: any) => s.id);
      previewSections(nextSections);
      commitSectionReorder(sectionListIds);
      setSelectedContainerState(
        selectedContainerState ? { ...selectedContainerState, index: index + step } : undefined,
      );
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
          onClickDuplicate: () => {
            const sel = selectedContainerState;
            if (!sel?.currentId) { return; }
            duplicateMutation.mutate({
              itemId: sel.currentId,
              parentId: courseIDtoBlockID(courseId),
              sectionId: sel.sectionId ?? sel.currentId,
            });
          },
          onClickMoveUp: () => handleMove(-1),
          onClickMoveDown: () => handleMove(1),
          onClickUnlink: () => openUnlinkModal({ value: sectionData, sectionId }),
          onClickDelete: () => {
            if (sectionData) {
              openDeleteModal({
                category: 'chapter',
                currentId: sectionData.id,
                sectionId: sectionData.id,
              });
            }
          },
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
        activeKey={currentTabKey}
        onSelect={setCurrentTabKey}
        mountOnEnter
      >
        <Tab eventKey={availableTabs.info} title={intl.formatMessage(messages.infoTabText)}>
          <InfoSection itemId={sectionId} />
        </Tab>
        <Tab
          eventKey={availableTabs.settings}
          title={intl.formatMessage(messages.settingsTabText)}
        >
          <SectionSettings key={sectionId} sectionId={sectionId} />
        </Tab>
      </Tabs>
    </>
  );
};
