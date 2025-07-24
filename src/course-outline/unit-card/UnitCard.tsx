import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useDispatch } from 'react-redux';
import { Icon, useToggle } from '@openedx/paragon';
import { Newsstand } from '@openedx/paragon/icons';
import { isEmpty } from 'lodash';
import { useSearchParams } from 'react-router-dom';

import CourseOutlineUnitCardExtraActionsSlot from '@src/plugin-slots/CourseOutlineUnitCardExtraActionsSlot';
import { setCurrentItem, setCurrentSection, setCurrentSubsection } from '@src/course-outline/data/slice';
import { fetchCourseSectionQuery } from '@src/course-outline/data/thunk';
import { RequestStatus } from '@src/data/constants';
import { isUnitReadOnly } from '@src/course-unit/data/utils';
import CardHeader from '@src/course-outline/card-header/CardHeader';
import SortableItem from '@src/course-outline/drag-helper/SortableItem';
import TitleLink from '@src/course-outline/card-header/TitleLink';
import XBlockStatus from '@src/course-outline/xblock-status/XBlockStatus';
import { getItemStatus, getItemStatusBorder, scrollToElement } from '@src/course-outline/utils';
import { useClipboard } from '@src/generic/clipboard';
import { PreviewLibraryXBlockChanges } from '@src/course-unit/preview-changes';
import { XBlock } from '@src/data/types';

interface UnitCardProps {
  unit: XBlock;
  subsection: XBlock;
  section: XBlock;
  onOpenPublishModal: () => void;
  onOpenConfigureModal: () => void;
  onEditSubmit: (itemId: string, sectionId: string, displayName: string) => void,
  savingStatus: string;
  onOpenDeleteModal: () => void;
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
      isVertical: true,
    };
  }, [upstreamInfo]);

  const readOnly = isUnitReadOnly(unit);

  // re-create actions object for customizations
  const actions = { ...unitActions };
  // add actions to control display of move up & down menu buton.
  const moveUpDetails = getPossibleMoves(index, -1);
  const moveDownDetails = getPossibleMoves(index, 1);
  actions.allowMoveUp = !isEmpty(moveUpDetails);
  actions.allowMoveDown = !isEmpty(moveDownDetails);

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
  }, [dispatch, section]);

  const titleComponent = (
    <TitleLink
      title={displayName}
      titleLink={getTitleLink(id)}
      namePrefix={namePrefix}
      prefixIcon={!!unit.upstreamInfo?.upstreamRef && (
        <Icon src={Newsstand} size="sm" className="mr-1" />
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

  const isDraggable = actions.draggable && (actions.allowMoveUp || actions.allowMoveDown);

  return (
    <>
      <SortableItem
        id={id}
        category={category}
        key={id}
        isDraggable={isDraggable}
        isDroppable={actions.childAddable}
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
            onClickMoveUp={handleUnitMoveUp}
            onClickMoveDown={handleUnitMoveDown}
            onClickSync={openSyncModal}
            isFormOpen={isFormOpen}
            closeForm={closeForm}
            onEditSubmit={handleEditSubmit}
            isDisabledEditField={readOnly || savingStatus === RequestStatus.IN_PROGRESS}
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
