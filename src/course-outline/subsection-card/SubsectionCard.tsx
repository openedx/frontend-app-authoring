import {
  useContext, useEffect, useState, useRef, useCallback, ReactNode, useMemo,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useToggle } from '@openedx/paragon';
import { useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import { isEmpty } from 'lodash';

import CourseOutlineSubsectionCardExtraActionsSlot from '@src/plugin-slots/CourseOutlineSubsectionCardExtraActionsSlot';
import CardHeader from '@src/course-outline/card-header/CardHeader';
import SortableItem from '@src/course-outline/drag-helper/SortableItem';
import { DragContext } from '@src/course-outline/drag-helper/DragContextProvider';
import { useClipboard, PasteComponent } from '@src/generic/clipboard';
import TitleButton from '@src/course-outline/card-header/TitleButton';
import XBlockStatus from '@src/course-outline/xblock-status/XBlockStatus';
import { getItemStatus, getItemStatusBorder, scrollToElement } from '@src/course-outline/utils';
import { ContainerType } from '@src/generic/key-utils';
import { UpstreamInfoIcon } from '@src/generic/upstream-info-icon';
import OutlineAddChildButtons from '@src/course-outline/OutlineAddChildButtons';
import { PreviewLibraryXBlockChanges } from '@src/course-unit/preview-changes';
import type { XBlock } from '@src/data/types';
import { invalidateLinksQuery } from '@src/course-libraries/data/apiHooks';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { useOutlineSidebarContext } from '@src/course-outline/outline-sidebar/OutlineSidebarContext';
import { courseOutlineQueryKeys, useCourseItemData } from '@src/course-outline/data/apiHooks';
import moment from 'moment';
import messages from './messages';

interface SubsectionCardProps {
  section: XBlock,
  subsection: XBlock,
  children: ReactNode
  isSectionsExpanded: boolean,
  isSelfPaced: boolean,
  isCustomRelativeDatesActive: boolean,
  onOpenDeleteModal: () => void,
  onDuplicateSubmit: () => void,
  index: number,
  getPossibleMoves: (index: number, step: number) => void,
  onOrderChange: (section: XBlock, moveDetails: any) => void,
  onOpenConfigureModal: () => void,
  onPasteClick: (parentLocator: string, sectionId: string) => void,
  resetScrollState: () => void,
}

const SubsectionCard = ({
  section: initialSectionData,
  subsection: initialData,
  isSectionsExpanded,
  isSelfPaced,
  isCustomRelativeDatesActive,
  children,
  index,
  getPossibleMoves,
  onOpenDeleteModal,
  onDuplicateSubmit,
  onOrderChange,
  onOpenConfigureModal,
  onPasteClick,
  resetScrollState,
}: SubsectionCardProps) => {
  const currentRef = useRef(null);
  const intl = useIntl();
  const { activeId, overId } = useContext(DragContext);
  const { selectedContainerState, openContainerInfoSidebar, setSelectedContainerState } = useOutlineSidebarContext();
  const [searchParams] = useSearchParams();
  const locatorId = searchParams.get('show');
  const [isSyncModalOpen, openSyncModal, closeSyncModal] = useToggle(false);
  const namePrefix = 'subsection';
  const { sharedClipboardData, showPasteUnit } = useClipboard();
  const {
    courseId, openUnlinkModal, openPublishModal, setCurrentSelection,
  } = useCourseAuthoringContext();
  const queryClient = useQueryClient();
  // Set initialData state from course outline and subsequently depend on its own state
  const { data: section = initialSectionData } = useCourseItemData(initialSectionData.id, initialSectionData);
  const { data: subsection = initialData } = useCourseItemData(initialData.id, initialData);
  const isScrolledToElement = locatorId === subsection.id;

  const {
    id,
    category,
    displayName,
    hasChanges,
    published,
    visibilityState,
    actions: subsectionActions,
    isHeaderVisible = true,
    enableCopyPasteUnits = false,
    proctoringExamConfigurationLink,
    upstreamInfo,
  } = subsection;

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
      blockType: 'subsection',
    };
  }, [upstreamInfo]);

  // re-create actions object for customizations
  const actions = { ...subsectionActions };
  // add actions to control display of move up & down menu button.
  const moveUpDetails = getPossibleMoves(index, -1);
  const moveDownDetails = getPossibleMoves(index, 1);
  actions.allowMoveUp = !isEmpty(moveUpDetails) && !section.upstreamInfo?.upstreamRef;
  actions.allowMoveDown = !isEmpty(moveDownDetails) && !section.upstreamInfo?.upstreamRef;
  actions.deletable = actions.deletable && !section.upstreamInfo?.upstreamRef;
  actions.duplicable = actions.duplicable && !section.upstreamInfo?.upstreamRef;

  // Expand the subsection if a search result should be shown/scrolled to
  const containsSearchResult = () => {
    if (locatorId) {
      return !!subsection.childInfo?.children?.filter((child) => child.id === locatorId).length;
    }

    return false;
  };
  const [isExpanded, setIsExpanded] = useState(containsSearchResult() || !isHeaderVisible || isSectionsExpanded);
  const subsectionStatus = getItemStatus({
    published,
    visibilityState,
    hasChanges,
  });
  const borderStyle = getItemStatusBorder(subsectionStatus);

  useEffect(() => {
    setIsExpanded(isSectionsExpanded);
  }, [isSectionsExpanded]);

  /**
  Temporary measure to keep the react-query state updated with redux state  */
  useEffect(() => {
    // istanbul ignore if
    if (moment(initialData.editedOnRaw).isAfter(moment(subsection.editedOnRaw))) {
      queryClient.cancelQueries({
        queryKey: courseOutlineQueryKeys.courseItemId(initialData.id),
      // eslint-disable-next-line no-console
      }).catch((error) => console.error('Error cancelling query:', error));
      queryClient.setQueryData(courseOutlineQueryKeys.courseItemId(initialData.id), initialData);
    }
  }, [initialData, subsection]);

  const handleExpandContent = () => {
    setIsExpanded((prevState) => !prevState);
  };

  const handleClickMenuButton = () => {
    setCurrentSelection({
      currentId: subsection.id,
      subsectionId: subsection.id,
      sectionId: section.id,
    });
  };

  const handleClickManageTags = () => {
    setSelectedContainerState({
      currentId: subsection.id,
      subsectionId: subsection.id,
      sectionId: section.id,
    });
  };

  const handleOnPostChangeSync = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: courseOutlineQueryKeys.courseItemId(section.id),
    });
    if (courseId) {
      invalidateLinksQuery(queryClient, courseId);
    }
  }, [section, queryClient, courseId]);

  const handleSubsectionMoveUp = () => {
    onOrderChange(section, moveUpDetails);
  };

  const handleSubsectionMoveDown = () => {
    onOrderChange(section, moveDownDetails);
  };

  const handlePasteButtonClick = () => onPasteClick(id, section.id);

  const titleComponent = (
    <TitleButton
      title={displayName}
      isExpanded={isExpanded}
      onTitleClick={handleExpandContent}
      namePrefix={namePrefix}
      prefixIcon={(
        <UpstreamInfoIcon
          upstreamInfo={upstreamInfo}
          size="sm"
          openSyncModal={openSyncModal}
        />
      )}
    />
  );

  const extraActionsComponent = (
    <CourseOutlineSubsectionCardExtraActionsSlot
      subsection={subsection}
      section={section}
    />
  );

  useEffect(() => {
    if (activeId === id && isExpanded) {
      setIsExpanded(false);
    } else if (overId === id && !isExpanded) {
      setIsExpanded(true);
    }
  }, [activeId, overId]);

  useEffect(() => {
    // if this items has been newly added, scroll to it.
    if (currentRef.current && (subsection.shouldScroll || isScrolledToElement)) {
      // Align element closer to the top of the screen if scrolling for search result
      const alignWithTop = !!isScrolledToElement;
      scrollToElement(currentRef.current, alignWithTop, true);
      resetScrollState();
    }
  }, [isScrolledToElement]);

  useEffect(() => {
    // If the locatorId is set/changed, we need to make sure that the subsection is expanded
    // if it contains the result, in order to scroll to it
    setIsExpanded((prevState) => (containsSearchResult() || prevState));
  }, [locatorId, setIsExpanded]);

  const isDraggable = (
    actions.draggable
      && (actions.allowMoveUp || actions.allowMoveDown)
      && !(isHeaderVisible === false)
      && !section.upstreamInfo?.upstreamRef
  );

  const onClickCard = useCallback((e: React.MouseEvent, preventNodeEvents: boolean) => {
    if (!preventNodeEvents || e.target === e.currentTarget) {
      openContainerInfoSidebar(subsection.id, subsection.id, section.id);
      setIsExpanded(true);
    }
  }, [openContainerInfoSidebar]);

  return (
    <>
      <SortableItem
        id={id}
        data={{
          category,
          displayName,
          childAddable: actions.childAddable,
          status: subsectionStatus,
        }}
        key={id}
        isDraggable={isDraggable}
        isDroppable={actions.childAddable || section.actions.childAddable}
        componentStyle={{
          background: '#f8f7f6',
          ...borderStyle,
        }}
        onClick={(e) => onClickCard(e, true)}
      >
        <div
          className={classNames(
            'subsection-card',
            {
              highlight: isScrolledToElement,
              'outline-card-selected': subsection.id === selectedContainerState?.currentId,
            },
          )}
          data-testid="subsection-card"
          ref={currentRef}
        >
          {isHeaderVisible && (
            <>
              <CardHeader
                title={displayName}
                status={subsectionStatus}
                cardId={id}
                hasChanges={hasChanges}
                onClickMenuButton={handleClickMenuButton}
                onClickPublish={() => openPublishModal({ value: subsection, sectionId: section.id })}
                onClickDelete={onOpenDeleteModal}
                onClickUnlink={/* istanbul ignore next */ () => openUnlinkModal({
                  value: subsection,
                  sectionId: section.id,
                })}
                onClickMoveUp={handleSubsectionMoveUp}
                onClickMoveDown={handleSubsectionMoveDown}
                onClickConfigure={onOpenConfigureModal}
                onClickSync={openSyncModal}
                onClickCard={(e) => onClickCard(e, true)}
                onClickDuplicate={onDuplicateSubmit}
                onClickManageTags={handleClickManageTags}
                titleComponent={titleComponent}
                namePrefix={namePrefix}
                actions={actions}
                proctoringExamConfigurationLink={proctoringExamConfigurationLink}
                isSequential
                extraActionsComponent={extraActionsComponent}
                readyToSync={upstreamInfo?.readyToSync}
              />
              {
                /* This is a special case; we can skip accessibility here (tabbing and select with keyboard) since the
                `SortableItem` component handles that for the whole `SubsectionCard`.
                This `onClick` allows the user to select the Card by clicking on white areas of this component. */
              }
              <div // eslint-disable-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
                className="subsection-card__content item-children"
                data-testid="subsection-card__content"
                onClick={
                  /* istanbul ignore next */
                  (e) => onClickCard(e, false)
                }
              >
                <XBlockStatus
                  isSelfPaced={isSelfPaced}
                  isCustomRelativeDatesActive={isCustomRelativeDatesActive}
                  blockData={subsection}
                />
              </div>
            </>
          )}
          {(isExpanded) && (
            <div
              data-testid="subsection-card__units"
              className={classNames('subsection-card__units', { 'item-children': isDraggable })}
            >
              {children}
              {actions.childAddable && (
                <>
                  <OutlineAddChildButtons
                    onClickCard={(e) => onClickCard(e, true)}
                    childType={ContainerType.Unit}
                    parentLocator={subsection.id}
                    grandParentLocator={section.id}
                  />
                  {enableCopyPasteUnits && showPasteUnit && sharedClipboardData && (
                    <PasteComponent
                      className="mt-4 border-gray-500 rounded-0"
                      text={intl.formatMessage(messages.pasteButton)}
                      clipboardData={sharedClipboardData}
                      onClick={handlePasteButtonClick}
                    />
                  )}
                </>
              )}
            </div>
          )}
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

export default SubsectionCard;
