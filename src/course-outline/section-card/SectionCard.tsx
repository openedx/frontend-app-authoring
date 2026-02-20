import {
  useContext, useEffect, useState, useRef, useCallback, ReactNode, useMemo,
} from 'react';
import {
  Bubble, Button, useToggle,
} from '@openedx/paragon';
import { useSearchParams } from 'react-router-dom';
import classNames from 'classnames';
import { useQueryClient } from '@tanstack/react-query';

import CardHeader from '@src/course-outline/card-header/CardHeader';
import SortableItem from '@src/course-outline/drag-helper/SortableItem';
import { DragContext } from '@src/course-outline/drag-helper/DragContextProvider';
import TitleButton from '@src/course-outline/card-header/TitleButton';
import XBlockStatus from '@src/course-outline/xblock-status/XBlockStatus';
import { getItemStatus, getItemStatusBorder, scrollToElement } from '@src/course-outline/utils';
import OutlineAddChildButtons from '@src/course-outline/OutlineAddChildButtons';
import { ContainerType } from '@src/generic/key-utils';
import { PreviewLibraryXBlockChanges } from '@src/course-unit/preview-changes';
import { UpstreamInfoIcon } from '@src/generic/upstream-info-icon';
import type { XBlock } from '@src/data/types';
import { invalidateLinksQuery } from '@src/course-libraries/data/apiHooks';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { useOutlineSidebarContext } from '@src/course-outline/outline-sidebar/OutlineSidebarContext';
import { courseOutlineQueryKeys, useCourseItemData } from '@src/course-outline/data/apiHooks';
import moment from 'moment';
import messages from './messages';

interface SectionCardProps {
  section: XBlock,
  isSelfPaced: boolean,
  isCustomRelativeDatesActive: boolean,
  children: ReactNode,
  onOpenHighlightsModal: (section: XBlock) => void,
  onOpenConfigureModal: () => void,
  onOpenDeleteModal: () => void,
  onDuplicateSubmit: () => void,
  isSectionsExpanded: boolean,
  index: number,
  canMoveItem: (oldIndex: number, newIndex: number) => boolean,
  onOrderChange: (oldIndex: number, newIndex: number) => void,
  resetScrollState: () => void,
}

const SectionCard = ({
  section: initialData,
  isSelfPaced,
  isCustomRelativeDatesActive,
  children,
  index,
  canMoveItem,
  onOpenHighlightsModal,
  onOpenConfigureModal,
  onOpenDeleteModal,
  onDuplicateSubmit,
  isSectionsExpanded,
  onOrderChange,
  resetScrollState,
}: SectionCardProps) => {
  const currentRef = useRef(null);
  const { activeId, overId } = useContext(DragContext);
  const { selectedContainerState, openContainerInfoSidebar, setSelectedContainerState } = useOutlineSidebarContext();
  const [searchParams] = useSearchParams();
  const locatorId = searchParams.get('show');
  const {
    courseId, openUnlinkModal, openPublishModal, setCurrentSelection,
  } = useCourseAuthoringContext();
  const queryClient = useQueryClient();
  // Set initialData state from course outline and subsequently depend on its own state
  const { data: section = initialData } = useCourseItemData(initialData.id, initialData);
  const isScrolledToElement = locatorId === section?.id;

  // Expand the section if a search result should be shown/scrolled to
  const containsSearchResult = () => {
    if (locatorId) {
      const subsections = section.childInfo?.children;
      if (subsections) {
        for (let i = 0; i < subsections.length; i++) {
          const subsection = subsections[i];

          // Check if the search result is one of the subsections
          const matchedSubsection = subsection.id === locatorId;
          if (matchedSubsection) {
            return true;
          }

          // Check if the search result is one of the units
          const matchedUnit = !!subsection.childInfo?.children?.filter((child) => child.id === locatorId).length;
          if (matchedUnit) {
            return true;
          }
        }
      }
    }

    return false;
  };
  const [isExpanded, setIsExpanded] = useState(containsSearchResult() || isSectionsExpanded);
  const [isSyncModalOpen, openSyncModal, closeSyncModal] = useToggle(false);
  const namePrefix = 'section';

  useEffect(() => {
    setIsExpanded(isSectionsExpanded);
  }, [isSectionsExpanded]);

  /**
  Temporary measure to keep the react-query state updated with redux state  */
  useEffect(() => {
    // istanbul ignore if
    if (moment(initialData.editedOnRaw).isAfter(moment(section.editedOnRaw))) {
      queryClient.cancelQueries({
        queryKey: courseOutlineQueryKeys.courseItemId(initialData.id),
      // eslint-disable-next-line no-console
      }).catch((error) => console.error('Error cancelling query:', error));
      queryClient.setQueryData(courseOutlineQueryKeys.courseItemId(initialData.id), initialData);
    }
  }, [initialData, section]);

  const {
    id,
    category,
    displayName,
    hasChanges,
    published,
    visibilityState,
    highlights,
    actions: sectionActions,
    isHeaderVisible = true,
    upstreamInfo,
  } = section;

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
      blockType: 'section',
    };
  }, [upstreamInfo]);

  useEffect(() => {
    if (activeId === id && isExpanded) {
      setIsExpanded(false);
    } else if (overId === id && !isExpanded) {
      setIsExpanded(true);
    }
  }, [activeId, overId]);

  useEffect(() => {
    if (currentRef.current && (section.shouldScroll || isScrolledToElement)) {
      // Align element closer to the top of the screen if scrolling for search result
      const alignWithTop = !!isScrolledToElement;
      scrollToElement(currentRef.current, alignWithTop, true);
      resetScrollState();
    }
  }, [isScrolledToElement]);

  useEffect(() => {
    // If the locatorId is set/changed, we need to make sure that the section is expanded
    // if it contains the result, in order to scroll to it
    setIsExpanded((prevState) => containsSearchResult() || prevState);
  }, [locatorId, setIsExpanded]);

  const handleOnPostChangeSync = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: courseOutlineQueryKeys.courseItemId(section.id),
    });
    if (courseId) {
      invalidateLinksQuery(queryClient, courseId);
    }
  }, [section, courseId, queryClient]);

  // re-create actions object for customizations
  const actions = { ...sectionActions };
  // add actions to control display of move up & down menu buton.
  actions.allowMoveUp = canMoveItem(index, -1);
  actions.allowMoveDown = canMoveItem(index, 1);

  const sectionStatus = getItemStatus({
    published,
    visibilityState,
    hasChanges,
  });

  // remove border when section is expanded
  const borderStyle = getItemStatusBorder(!isExpanded ? sectionStatus : undefined);

  const handleExpandContent = () => {
    setIsExpanded((prevState) => !prevState);
  };

  const handleClickMenuButton = () => {
    setCurrentSelection({
      currentId: section.id,
      sectionId: section.id,
    });
  };

  const handleClickManageTags = () => {
    setSelectedContainerState({
      currentId: section.id,
      sectionId: section.id,
    });
  };

  const handleOpenHighlightsModal = () => {
    onOpenHighlightsModal(section);
  };

  const handleSectionMoveUp = () => {
    onOrderChange(index, index - 1);
  };

  const handleSectionMoveDown = () => {
    onOrderChange(index, index + 1);
  };

  const titleComponent = (
    <TitleButton
      title={displayName}
      isExpanded={isExpanded}
      onTitleClick={handleExpandContent}
      namePrefix={namePrefix}
      prefixIcon={(
        <UpstreamInfoIcon
          upstreamInfo={upstreamInfo}
          size="md"
          openSyncModal={openSyncModal}
        />
      )}
    />
  );

  const isDraggable = actions.draggable && (actions.allowMoveUp || actions.allowMoveDown);

  const onClickCard = useCallback((e: React.MouseEvent, preventNodeEvents: boolean) => {
    if (!preventNodeEvents || e.target === e.currentTarget) {
      openContainerInfoSidebar(section.id, undefined, section.id);
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
          status: sectionStatus,
          childAddable: actions.childAddable,
        }}
        isDraggable={isDraggable}
        componentStyle={{
          padding: '1.75rem',
          ...borderStyle,
        }}
        onClick={(e) => onClickCard(e, true)}
      >
        <div
          className={classNames(
            'section-card',
            {
              highlight: isScrolledToElement,
              'outline-card-selected': section.id === selectedContainerState?.currentId,
            },
          )}
          data-testid="section-card"
          ref={currentRef}
        >
          <div>
            {isHeaderVisible && (
              <CardHeader
                cardId={id}
                title={displayName}
                status={sectionStatus}
                hasChanges={hasChanges}
                onClickMenuButton={handleClickMenuButton}
                onClickPublish={/* istanbul ignore next */ () => openPublishModal({
                  value: section,
                  sectionId: section.id,
                })}
                onClickConfigure={onOpenConfigureModal}
                onClickDelete={onOpenDeleteModal}
                onClickUnlink={() => openUnlinkModal({ value: section, sectionId: section.id })}
                onClickMoveUp={handleSectionMoveUp}
                onClickMoveDown={handleSectionMoveDown}
                onClickSync={openSyncModal}
                onClickCard={(e) => onClickCard(e, true)}
                onClickDuplicate={onDuplicateSubmit}
                onClickManageTags={handleClickManageTags}
                titleComponent={titleComponent}
                namePrefix={namePrefix}
                actions={actions}
                readyToSync={upstreamInfo?.readyToSync}
              />
            )}
            <div className="section-card__content" data-testid="section-card__content">
              {
                /* This is a special case; we can skip accessibility here (tabbing and select with keyboard) since the
                `SortableItem` component handles that for the whole `SectionCard`.
                This `onClick` allows the user to select the Card by clicking on white areas of this component. */
              }
              <div // eslint-disable-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
                className="outline-section__status mb-1"
                onClick={
                  /* istanbul ignore next */
                  (e) => onClickCard(e, true)
                }
              >
                <Button
                  className="p-0 bg-transparent"
                  data-destid="section-card-highlights-button"
                  variant="tertiary"
                  onClick={handleOpenHighlightsModal}
                >
                  <Bubble className="mr-1">
                    {highlights.length}
                  </Bubble>
                  <p className="m-0 text-black">{messages.sectionHighlightsBadge.defaultMessage}</p>
                </Button>
              </div>
              {
                /* This is a special case; we can skip accessibility here (tabbing and select with keyboard) since the
                `SortableItem` component handles that for the whole `SectionCard`.
                This `onClick` allows the user to select the Card by clicking on white areas of this component. */
              }
              <div // eslint-disable-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
                onClick={
                  /* istanbul ignore next */
                  (e) => onClickCard(e, false)
                }
              >
                <XBlockStatus
                  isSelfPaced={isSelfPaced}
                  isCustomRelativeDatesActive={isCustomRelativeDatesActive}
                  blockData={section}
                />
              </div>
            </div>
            {isExpanded && (
              <div
                data-testid="section-card__subsections"
                className={classNames('section-card__subsections', { 'item-children': isDraggable })}
              >
                {children}
                {actions.childAddable && (
                  <OutlineAddChildButtons
                    onClickCard={(e) => onClickCard(e, true)}
                    childType={ContainerType.Subsection}
                    parentLocator={section.id}
                  />
                )}
              </div>
            )}
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

export default SectionCard;
