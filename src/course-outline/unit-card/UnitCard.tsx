import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useDispatch } from 'react-redux';
import { useToggle } from '@openedx/paragon';
import { isEmpty } from 'lodash';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import CourseOutlineUnitCardExtraActionsSlot from '@src/plugin-slots/CourseOutlineUnitCardExtraActionsSlot';
import { setCurrentItem, setCurrentSection, setCurrentSubsection } from '@src/course-outline/data/slice';
import { fetchCourseSectionQuery } from '@src/course-outline/data/thunk';
import { RequestStatus, RequestStatusType } from '@src/data/constants';
import CardHeader from '@src/course-outline/card-header/CardHeader';
import SortableItem from '@src/course-outline/drag-helper/SortableItem';
import TitleLink from '@src/course-outline/card-header/TitleLink';
import XBlockStatus from '@src/course-outline/xblock-status/XBlockStatus';
import { getItemStatus, getItemStatusBorder, scrollToElement } from '@src/course-outline/utils';
import { useClipboard } from '@src/generic/clipboard';
import { UpstreamInfoIcon } from '@src/generic/upstream-info-icon';
import { PreviewLibraryXBlockChanges } from '@src/course-unit/preview-changes';
import { invalidateLinksQuery } from '@src/course-libraries/data/apiHooks';
import type { XBlock } from '@src/data/types';

interface UnitCardProps {
  unit: XBlock;
  subsection: XBlock;
  section: XBlock;
  onOpenPublishModal: () => void;
  onOpenConfigureModal: () => void;
  onEditSubmit: (itemId: string, sectionId: string, displayName: string) => void,
  savingStatus?: RequestStatusType;
  onOpenDeleteModal: () => void;
  onOpenUnlinkModal: () => void;
  onDuplicateSubmit: () => void;
  getTitleLink: (locator: string) => string;
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
  unit,
  subsection,
  section,
  isSelfPaced,
  isCustomRelativeDatesActive,
  index,
  getPossibleMoves,
  onOpenPublishModal,
  onOpenConfigureModal,
  onEditSubmit,
  savingStatus,
  onOpenDeleteModal,
  onOpenUnlinkModal,
  onDuplicateSubmit,
  getTitleLink,
  onOrderChange,
  discussionsSettings,
}: UnitCardProps) => {
  const currentRef = useRef(null);
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const locatorId = searchParams.get('show');
  const isScrolledToElement = locatorId === unit.id;
  const [isFormOpen, openForm, closeForm] = useToggle(false);
  const [isSyncModalOpen, openSyncModal, closeSyncModal] = useToggle(false);
  const namePrefix = 'unit';

  const { copyToClipboard } = useClipboard();
  const { courseId } = useParams();
  const queryClient = useQueryClient();

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

  const handleClickMenuButton = () => {
    dispatch(setCurrentItem(unit));
    dispatch(setCurrentSection(section));
    dispatch(setCurrentSubsection(subsection));
  };

  const handleEditSubmit = (titleValue: string) => {
    if (displayName !== titleValue) {
      onEditSubmit(id, section.id, titleValue);
      return;
    }

    closeForm();
  };

  const handleUnitMoveUp = () => {
    onOrderChange(section, moveUpDetails);
  };

  const handleUnitMoveDown = () => {
    onOrderChange(section, moveDownDetails);
  };

  const handleCopyClick = () => {
    copyToClipboard(id);
  };

  const handleOnPostChangeSync = useCallback(() => {
    dispatch(fetchCourseSectionQuery([section.id]));
    if (courseId) {
      invalidateLinksQuery(queryClient, courseId);
    }
  }, [dispatch, section, queryClient, courseId]);

  const titleComponent = (
    <TitleLink
      title={displayName}
      titleLink={getTitleLink(id)}
      namePrefix={namePrefix}
      prefixIcon={<UpstreamInfoIcon upstreamInfo={upstreamInfo} size="sm" />}
    />
  );

  const extraActionsComponent = (
    <CourseOutlineUnitCardExtraActionsSlot
      unit={unit}
      subsection={subsection}
      section={section}
    />
  );

  useEffect(() => {
    // if this items has been newly added, scroll to it.
    if (currentRef.current && (unit.shouldScroll || isScrolledToElement)) {
      // Align element closer to the top of the screen if scrolling for search result
      const alignWithTop = !!isScrolledToElement;
      scrollToElement(currentRef.current, alignWithTop, true);
    }
  }, [isScrolledToElement]);

  useEffect(() => {
    if (savingStatus === RequestStatus.SUCCESSFUL) {
      closeForm();
    }
  }, [savingStatus]);

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
      >
        <div
          className={`unit-card ${isScrolledToElement ? 'highlight' : ''}`}
          data-testid="unit-card"
          ref={currentRef}
        >
          <CardHeader
            title={displayName}
            status={unitStatus}
            hasChanges={hasChanges}
            cardId={id}
            onClickMenuButton={handleClickMenuButton}
            onClickPublish={onOpenPublishModal}
            onClickConfigure={onOpenConfigureModal}
            onClickEdit={openForm}
            onClickDelete={onOpenDeleteModal}
            onClickUnlink={onOpenUnlinkModal}
            onClickMoveUp={handleUnitMoveUp}
            onClickMoveDown={handleUnitMoveDown}
            onClickSync={openSyncModal}
            isFormOpen={isFormOpen}
            closeForm={closeForm}
            onEditSubmit={handleEditSubmit}
            savingStatus={savingStatus}
            onClickDuplicate={onDuplicateSubmit}
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
