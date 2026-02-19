import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import classNames from 'classnames';
import { useToggle } from '@openedx/paragon';
import { isEmpty } from 'lodash';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import CourseOutlineUnitCardExtraActionsSlot from '@src/plugin-slots/CourseOutlineUnitCardExtraActionsSlot';
import CardHeader from '@src/course-outline/card-header/CardHeader';
import SortableItem from '@src/course-outline/drag-helper/SortableItem';
import TitleLink from '@src/course-outline/card-header/TitleLink';
import XBlockStatus from '@src/course-outline/xblock-status/XBlockStatus';
import { getItemStatus, getItemStatusBorder, scrollToElement } from '@src/course-outline/utils';
import { useClipboard } from '@src/generic/clipboard';
import { UpstreamInfoIcon } from '@src/generic/upstream-info-icon';
import { PreviewLibraryXBlockChanges } from '@src/course-unit/preview-changes';
import { invalidateLinksQuery } from '@src/course-libraries/data/apiHooks';
import type { UnitXBlock, XBlock } from '@src/data/types';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { courseOutlineQueryKeys, useCourseItemData } from '@src/course-outline/data/apiHooks';
import moment from 'moment';
import { useOutlineSidebarContext } from '../outline-sidebar/OutlineSidebarContext';

interface UnitCardProps {
  unit: UnitXBlock;
  subsection: XBlock;
  section: XBlock;
  onOpenConfigureModal: () => void;
  onOpenDeleteModal: () => void;
  onDuplicateSubmit: () => void;
  index: number;
  getPossibleMoves: (index: number, step: number) => void,
  onOrderChange: (section: XBlock, moveDetails: any) => void,
  isSelfPaced: boolean;
  isCustomRelativeDatesActive: boolean;
  discussionsSettings: {
    providerType: string;
    enableGradedUnits: boolean;
  };
}

const UnitCard = ({
  unit: initialData,
  subsection: initialSubsectionData,
  section: initialSectionData,
  isSelfPaced,
  isCustomRelativeDatesActive,
  index,
  getPossibleMoves,
  onOpenConfigureModal,
  onOpenDeleteModal,
  onDuplicateSubmit,
  onOrderChange,
  discussionsSettings,
}: UnitCardProps) => {
  const currentRef = useRef(null);
  const [searchParams] = useSearchParams();
  const { selectedContainerState, openContainerInfoSidebar, setSelectedContainerState } = useOutlineSidebarContext();
  const locatorId = searchParams.get('show');
  const [isSyncModalOpen, openSyncModal, closeSyncModal] = useToggle(false);
  const namePrefix = 'unit';

  const { copyToClipboard } = useClipboard();
  const {
    courseId, getUnitUrl, openUnlinkModal, openPublishModal, setCurrentSelection,
  } = useCourseAuthoringContext();
  const queryClient = useQueryClient();
  const { data: section = initialSectionData } = useCourseItemData(initialSectionData.id, initialSectionData);
  const { data: subsection = initialSubsectionData } = useCourseItemData(
    initialSubsectionData.id,
    initialSubsectionData,
  );
  const { data: unit = initialData } = useCourseItemData<UnitXBlock>(initialData.id, initialData);
  const isScrolledToElement = locatorId === unit.id;

  const {
    id,
    category,
    displayName,
    hasChanges,
    published,
    visibilityState,
    actions: unitActions,
    isHeaderVisible = true,
    enableCopyPasteUnits = false,
    discussionEnabled,
    upstreamInfo,
  } = unit;

  const blockSyncData = useMemo(() => {
    if (!upstreamInfo?.readyToSync) {
      return undefined;
    }
    return {
      displayName,
      downstreamBlockId: id,
      upstreamBlockId: upstreamInfo.upstreamRef,
      upstreamBlockVersionSynced: upstreamInfo.versionSynced,
      isReadyToSyncIndividually: upstreamInfo.isReadyToSyncIndividually,
      isContainer: true,
      blockType: 'unit',
    };
  }, [upstreamInfo]);

  // re-create actions object for customizations
  const actions = { ...unitActions };
  // add actions to control display of move up & down menu buton.
  const moveUpDetails = getPossibleMoves(index, -1);
  const moveDownDetails = getPossibleMoves(index, 1);
  actions.allowMoveUp = !isEmpty(moveUpDetails) && !subsection.upstreamInfo?.upstreamRef;
  actions.allowMoveDown = !isEmpty(moveDownDetails) && !subsection.upstreamInfo?.upstreamRef;
  actions.deletable = actions.deletable && !subsection.upstreamInfo?.upstreamRef;
  actions.duplicable = actions.duplicable && !subsection.upstreamInfo?.upstreamRef;

  const parentInfo = {
    graded: subsection.graded,
    isTimeLimited: subsection.isTimeLimited,
  };

  const unitStatus = getItemStatus({
    published,
    visibilityState,
    hasChanges,
  });
  const borderStyle = getItemStatusBorder(unitStatus);

  const selectAndTrigger = () => {
    setCurrentSelection({
      currentId: unit.id,
      subsectionId: subsection.id,
      sectionId: section.id,
    });
  };

  const handleClickManageTags = () => {
    setSelectedContainerState({
      currentId: unit.id,
      subsectionId: subsection.id,
      sectionId: section.id,
    });
  };

  const handleUnitMoveUp = () => {
    onOrderChange(section, moveUpDetails);
  };

  const handleUnitMoveDown = () => {
    onOrderChange(section, moveDownDetails);
  };

  const handleCopyClick = () => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    copyToClipboard(id);
  };

  const handleOnPostChangeSync = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: courseOutlineQueryKeys.courseItemId(section.id),
    });
    if (courseId) {
      invalidateLinksQuery(queryClient, courseId);
    }
  }, [section, queryClient, courseId]);

  const onClickCard = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      openContainerInfoSidebar(unit.id, subsection.id, section.id);
    }
  }, [openContainerInfoSidebar]);

  const titleComponent = (
    <TitleLink
      title={displayName}
      titleLink={getUnitUrl(id)}
      namePrefix={namePrefix}
      prefixIcon={(
        <UpstreamInfoIcon
          upstreamInfo={upstreamInfo}
          size="xs"
          openSyncModal={openSyncModal}
        />
      )}
    />
  );

  const extraActionsComponent = (
    <CourseOutlineUnitCardExtraActionsSlot
      unit={unit}
      subsection={subsection}
      section={section}
    />
  );

  /**
  Temporary measure to keep the react-query state updated with redux state  */
  useEffect(() => {
    // istanbul ignore if
    if (moment(initialData.editedOnRaw).isAfter(moment(unit.editedOnRaw))) {
      queryClient.cancelQueries({queryKey: courseOutlineQueryKeys.courseItemId(initialData.id)});
      queryClient.setQueryData(courseOutlineQueryKeys.courseItemId(initialData.id), initialData);
    }
  }, [initialData, unit]);

  useEffect(() => {
    // if this items has been newly added, scroll to it.
    if (currentRef.current && (unit.shouldScroll || isScrolledToElement)) {
      // Align element closer to the top of the screen if scrolling for search result
      const alignWithTop = !!isScrolledToElement;
      scrollToElement(currentRef.current, alignWithTop, true);
    }
  }, [isScrolledToElement]);

  if (!isHeaderVisible) {
    return null;
  }

  const isDraggable = (
    actions.draggable
      && (actions.allowMoveUp || actions.allowMoveDown)
      && !subsection.upstreamInfo?.upstreamRef
  );

  return (
    <>
      <SortableItem
        id={id}
        key={id}
        data={{
          category,
          status: unitStatus,
          displayName,
        }}
        isDraggable={isDraggable}
        isDroppable={subsection.actions.childAddable}
        componentStyle={{
          background: '#fdfdfd',
          ...borderStyle,
        }}
        onClick={onClickCard}
      >
        <div
          className={classNames(
            'unit-card',
            {
              highlight: isScrolledToElement,
              'outline-card-selected': unit.id === selectedContainerState?.currentId,
            },
          )}
          data-testid="unit-card"
          ref={currentRef}
        >
          <CardHeader
            title={displayName}
            status={unitStatus}
            hasChanges={hasChanges}
            cardId={id}
            onClickMenuButton={selectAndTrigger}
            onClickPublish={() => openPublishModal({
              value: unit,
              sectionId: section.id,
              subsectionId: subsection.id,
            })}
            onClickConfigure={onOpenConfigureModal}
            onClickDelete={onOpenDeleteModal}
            onClickUnlink={/* istanbul ignore next */ () => openUnlinkModal({
              value: unit,
              sectionId: section.id,
              subsectionId: subsection.id,
            })}
            onClickMoveUp={handleUnitMoveUp}
            onClickMoveDown={handleUnitMoveDown}
            onClickSync={openSyncModal}
            onClickCard={onClickCard}
            onClickDuplicate={onDuplicateSubmit}
            onClickManageTags={handleClickManageTags}
            titleComponent={titleComponent}
            namePrefix={namePrefix}
            actions={actions}
            isVertical
            enableCopyPasteUnits={enableCopyPasteUnits}
            onClickCopy={handleCopyClick}
            discussionEnabled={discussionEnabled}
            discussionsSettings={discussionsSettings}
            parentInfo={parentInfo}
            extraActionsComponent={extraActionsComponent}
            readyToSync={upstreamInfo?.readyToSync}
          />
          <div className="unit-card__content item-children" data-testid="unit-card__content">
            <XBlockStatus
              isSelfPaced={isSelfPaced}
              isCustomRelativeDatesActive={isCustomRelativeDatesActive}
              blockData={unit}
            />
          </div>
        </div>
      </SortableItem>
      {blockSyncData && (
        <PreviewLibraryXBlockChanges
          blockData={blockSyncData}
          isModalOpen={isSyncModalOpen}
          closeModal={closeSyncModal}
          postChange={handleOnPostChangeSync}
        />
      )}
    </>
  );
};

export default UnitCard;
