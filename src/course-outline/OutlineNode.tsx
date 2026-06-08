/**
 * OutlineNode — unified card renderer for all three outline levels.
 */
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bubble, Button, useToggle } from '@openedx/paragon';
import { useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import moment from 'moment';
import { isEmpty } from 'lodash';

import CardHeader from './card-header/CardHeader';
import SortableItem from './drag-helper/SortableItem';
import { DragContext } from './drag-helper/DragContextProvider';
import TitleButton from './card-header/TitleButton';
import TitleLink from './card-header/TitleLink';
import XBlockStatus from './xblock-status/XBlockStatus';
import { courseIDtoBlockID, getItemStatus, getItemStatusBorder, scrollToElement } from './utils';
import { ContainerType } from '@src/generic/key-utils';
import { UpstreamInfoIcon } from '@src/generic/upstream-info-icon';
import { PreviewLibraryXBlockChanges } from '@src/course-unit/preview-changes';
import { invalidateLinksQuery } from '@src/course-libraries/data/apiHooks';
import { handleResponseErrors } from '@src/generic/saving-error-alert';
import { useClipboard, PasteComponent } from '@src/generic/clipboard';
import { useIntl } from '@edx/frontend-platform/i18n';
import type { OutlineActionSelection, XBlock } from '@src/data/types';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { useCourseOutlineContext } from './CourseOutlineContext';
import { useOutlineSidebarContext } from './outline-sidebar/OutlineSidebarContext';
import { courseOutlineQueryKeys } from './data/queryKeys';
import { useCourseItemData, useScrollState, useDuplicateItem } from './data/apiHooks';
import OutlineAddChildButtons from './OutlineAddChildButtons';
import CourseOutlineSubsectionCardExtraActionsSlot from '@src/plugin-slots/CourseOutlineSubsectionCardExtraActionsSlot';
import CourseOutlineUnitCardExtraActionsSlot from '@src/plugin-slots/CourseOutlineUnitCardExtraActionsSlot';
import sectionMessages from './section-card/messages';
import subsectionMessages from './subsection-card/messages';

type Depth = 0 | 1 | 2;
type IconSize = 'md' | 'sm' | 'xs';

interface LevelConfig {
  name: string;
  contentClass: string;
  contentTestId: string;
  childContainerClass?: string;
  childContainerTestId?: string;
  containerType?: ContainerType;
  iconSize: IconSize;
  background: CSSProperties;
}

const LEVEL_CONFIG: Record<Depth, LevelConfig> = {
  0: {
    name: 'section',
    contentClass: 'section-card__content',
    contentTestId: 'section-card__content',
    childContainerClass: 'section-card__subsections',
    childContainerTestId: 'section-card__subsections',
    containerType: ContainerType.Subsection,
    iconSize: 'md',
    background: { padding: '1.75rem' },
  },
  1: {
    name: 'subsection',
    contentClass: 'subsection-card__content item-children',
    contentTestId: 'subsection-card__content',
    childContainerClass: 'subsection-card__units',
    childContainerTestId: 'subsection-card__units',
    containerType: ContainerType.Unit,
    iconSize: 'sm',
    background: { background: '#f8f7f6' },
  },
  2: {
    name: 'unit',
    contentClass: 'unit-card__content item-children',
    contentTestId: 'unit-card__content',
    iconSize: 'xs',
    background: { background: '#fdfdfd' },
  },
};

export interface OutlineNodeProps {
  block: XBlock;
  depth: Depth;
  index: number;
  isSelfPaced: boolean;
  isCustomRelativeDatesActive: boolean;
  isSectionsExpanded: boolean;
  getPossibleMoves?: (index: number, step: number) => any;
  onOrderChange: (parentBlock: XBlock, moveDetails: any) => void;
  onOpenConfigureModal: (selection: OutlineActionSelection) => void;
  onOpenDeleteModal: (selection: OutlineActionSelection) => void;
  onOpenHighlightsModal?: (section: XBlock) => void;
  canMoveItem?: (oldIndex: number, newIndex: number) => boolean;
  onPasteClick?: (parentLocator: string, subsectionId: string, sectionId: string) => void;
  section?: XBlock;
  subsection?: XBlock;
  discussionsSettings?: { providerType: string; enableGradedUnits: boolean; };
  children?: ReactNode;
  expandedExtra?: ReactNode;
  testId?: string;
}

const OutlineNode = ({
  block: initialData,
  depth,
  index,
  isSelfPaced,
  isCustomRelativeDatesActive,
  isSectionsExpanded,
  getPossibleMoves,
  onOrderChange,
  onOpenConfigureModal,
  onOpenDeleteModal,
  onOpenHighlightsModal,
  canMoveItem,
  section: parentSection,
  subsection: parentSubsection,
  onPasteClick,
  discussionsSettings,
  children,
  expandedExtra,
  testId,
}: OutlineNodeProps) => {
  const currentRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const locatorId = searchParams.get('show');
  const [isSyncModalOpen, openSyncModal, closeSyncModal] = useToggle(false);

  const { activeId, overId } = useContext(DragContext);
  const { selectedContainerState, openContainerSidebar, setSelectedContainerState } = useOutlineSidebarContext();
  const { courseId, openUnlinkModal, getUnitUrl } = useCourseAuthoringContext();
  const duplicateMutation = useDuplicateItem(courseId);
  const { openPublishModal } = useCourseOutlineContext();
  const queryClient = useQueryClient();
  const { sharedClipboardData, showPasteUnit, copyToClipboard } = useClipboard();
  const intl = useIntl();

  const { data: liveBlock = initialData } = useCourseItemData(initialData.id, initialData as any);
  const { data: scrollState, resetData: resetScrollState } = useScrollState(courseId);

  const levelConfig = LEVEL_CONFIG[depth];
  const blk = liveBlock as any;
  const initBlk = initialData as any;
  const effectiveSection: XBlock = parentSection || (depth === 0 ? initialData : parentSection!)!;
  const isScrolledToElement = locatorId === blk.id;

  const shouldRenderUnit = !(depth === 2 && blk.isHeaderVisible === false);

  const blockSyncData = useMemo(() => {
    if (!blk.upstreamInfo?.readyToSync) { return undefined; }
    return {
      displayName: blk.displayName,
      downstreamBlockId: blk.id,
      upstreamBlockId: blk.upstreamInfo.upstreamRef,
      upstreamBlockVersionSynced: blk.upstreamInfo.versionSynced,
      isReadyToSyncIndividually: blk.upstreamInfo.isReadyToSyncIndividually,
      isContainer: true,
      blockType: levelConfig.name,
    };
  }, [blk.upstreamInfo, blk.displayName, blk.id, levelConfig.name]);

  const handleOnPostChangeSync = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: courseOutlineQueryKeys.courseItemId(effectiveSection.id),
    });
    if (courseId) { invalidateLinksQuery(queryClient, courseId); }
  }, [effectiveSection, courseId, queryClient]);

  useEffect(() => {
    if (moment(initBlk.editedOnRaw).isAfter(moment(blk.editedOnRaw))) {
      queryClient.cancelQueries({
        queryKey: courseOutlineQueryKeys.courseItemId(initialData.id),
      }).catch((error) => console.error('Error cancelling query:', error));
      queryClient.setQueryData(courseOutlineQueryKeys.courseItemId(initialData.id), initialData);
    }
  }, [initBlk, blk, initialData, queryClient]);

  useEffect(() => {
    if (currentRef.current && ((scrollState?.id === blk.id) || isScrolledToElement)) {
      scrollToElement(currentRef.current, !!isScrolledToElement, true);
      resetScrollState().catch((error) => handleResponseErrors(error));
    }
  }, [isScrolledToElement, scrollState, resetScrollState, blk.id]);

  const containsSearchResult = useCallback(() => {
    if (!locatorId || depth === 2) { return false; }
    if (depth === 0) {
      const subs = blk.childInfo?.children ?? [];
      return subs.some(
        (sub: any) =>
          sub.id === locatorId
          || sub.childInfo?.children?.some((u: any) => u.id === locatorId),
      );
    }
    return blk.childInfo?.children?.some((u: any) => u.id === locatorId) ?? false;
  }, [locatorId, blk.childInfo, depth]);

  const isHeaderVisible = blk.isHeaderVisible !== false;
  const [isExpanded, setIsExpanded] = useState(
    depth < 2 &&
      (containsSearchResult() || (depth === 0 ? isSectionsExpanded : (!isHeaderVisible || isSectionsExpanded))),
  );

  useEffect(() => {
    if (depth < 2) { setIsExpanded(isSectionsExpanded); }
  }, [isSectionsExpanded, depth]);

  useEffect(() => {
    if (depth < 2) {
      if (activeId === blk.id && isExpanded) { setIsExpanded(false); }
      else if (overId === blk.id && !isExpanded) { setIsExpanded(true); }
    }
  }, [activeId, overId, blk.id, isExpanded, depth]);

  useEffect(() => {
    if (depth < 2 && locatorId) { setIsExpanded((prev: boolean) => containsSearchResult() || prev); }
  }, [locatorId, containsSearchResult, depth]);

  useEffect(() => {
    if (depth !== 0 || !scrollState?.id) { return; }
    const subs = blk.childInfo?.children ?? [];
    if (
      subs.some(
        (sub: any) =>
          sub.id === scrollState.id
          || sub.childInfo?.children?.some((u: any) => u.id === scrollState.id),
      )
    ) { setIsExpanded(true); }
  }, [scrollState?.id, blk.childInfo, depth]);

  const actions = { ...blk.actions };
  if (depth === 0 && canMoveItem) {
    actions.allowMoveUp = canMoveItem(index, -1);
    actions.allowMoveDown = canMoveItem(index, 1);
  } else if (depth > 0 && getPossibleMoves) {
    const moveUp = getPossibleMoves(index, -1);
    const moveDown = getPossibleMoves(index, 1);
    const inhibit = depth === 1
      ? parentSection?.upstreamInfo?.upstreamRef
      : parentSubsection?.upstreamInfo?.upstreamRef;
    actions.allowMoveUp = !isEmpty(moveUp) && !inhibit;
    actions.allowMoveDown = !isEmpty(moveDown) && !inhibit;
    actions.deletable = actions.deletable && !inhibit;
    actions.duplicable = actions.duplicable && !inhibit;
  }

  const blockStatus = getItemStatus({
    published: blk.published,
    visibilityState: blk.visibilityState,
    hasChanges: blk.hasChanges,
  });
  const borderStyle = getItemStatusBorder(depth < 2 && isExpanded ? undefined : blockStatus);

  const onClickCard = useCallback((e: React.MouseEvent, preventNodeEvents?: boolean) => {
    if (!preventNodeEvents || e.target === e.currentTarget) {
      if (depth === 0) {
        openContainerSidebar(blk.id, undefined, blk.id, index);
        setIsExpanded(true);
      } else if (depth === 1) {
        openContainerSidebar(blk.id, blk.id, parentSection?.id ?? blk.id, index);
        setIsExpanded(true);
      } else { openContainerSidebar(blk.id, parentSubsection?.id ?? blk.id, parentSection?.id ?? blk.id, index); }
    }
  }, [depth, blk.id, index, openContainerSidebar, parentSection, parentSubsection]);

  const handleClickManageTags = useCallback(() => {
    setSelectedContainerState(
      depth === 0
        ? { currentId: blk.id, sectionId: blk.id, index }
        : depth === 1
        ? { currentId: blk.id, subsectionId: blk.id, sectionId: parentSection?.id ?? blk.id, index }
        : {
          currentId: blk.id,
          subsectionId: parentSubsection?.id ?? blk.id,
          sectionId: parentSection?.id ?? blk.id,
          index,
        },
    );
  }, [depth, blk.id, index, parentSection, parentSubsection, setSelectedContainerState]);

  const handleMoveUp = () => {
    if (depth === 0) { onOrderChange(initialData, { oldIndex: index, newIndex: index - 1 }); }
    else { onOrderChange(effectiveSection, getPossibleMoves!(index, -1)); }
  };
  const handleMoveDown = () => {
    if (depth === 0) { onOrderChange(initialData, { oldIndex: index, newIndex: index + 1 }); }
    else { onOrderChange(effectiveSection, getPossibleMoves!(index, 1)); }
  };

  const isDraggable = !!actions.draggable && !!(actions.allowMoveUp || actions.allowMoveDown)
    && (depth === 0 || (
      isHeaderVisible
      && !(depth === 1 ? parentSection?.upstreamInfo?.upstreamRef : parentSubsection?.upstreamInfo?.upstreamRef)
    ));

  const titleComponent = depth < 2 ?
    (
      <TitleButton
        title={blk.displayName}
        isExpanded={isExpanded}
        onTitleClick={() => setIsExpanded((p: boolean) => !p)}
        namePrefix={levelConfig.name}
        prefixIcon={
          <UpstreamInfoIcon upstreamInfo={blk.upstreamInfo} size={levelConfig.iconSize} openSyncModal={openSyncModal} />
        }
      />
    ) :
    (
      <TitleLink
        title={blk.displayName}
        titleLink={getUnitUrl(blk.id)}
        namePrefix={levelConfig.name}
        prefixIcon={
          <UpstreamInfoIcon upstreamInfo={blk.upstreamInfo} size={levelConfig.iconSize} openSyncModal={openSyncModal} />
        }
      />
    );

  const extraActionsComponent = depth === 1 && parentSection ?
    <CourseOutlineSubsectionCardExtraActionsSlot subsection={liveBlock as any} section={parentSection as any} /> :
    depth === 2 && parentSection && parentSubsection ?
    (
      <CourseOutlineUnitCardExtraActionsSlot
        unit={liveBlock as any}
        subsection={parentSubsection as any}
        section={parentSection as any}
      />
    ) :
    undefined;

  const isDroppable = depth === 2
    ? (parentSubsection as any)?.actions?.childAddable ?? false
    : actions.childAddable || (parentSection?.actions?.childAddable ?? false);

  const showPaste = depth === 1 && blk.enableCopyPasteUnits && showPasteUnit && sharedClipboardData;

  if (!shouldRenderUnit) { return null; }

  return (
    <>
      <SortableItem
        id={blk.id}
        data={{
          category: blk.category,
          displayName: blk.displayName,
          status: blockStatus,
          ...(depth < 2 ? { childAddable: actions.childAddable } : {}),
        }}
        isDraggable={isDraggable}
        isDroppable={isDroppable}
        key={blk.id}
        componentStyle={{ ...levelConfig.background, ...borderStyle }}
        onClick={(e) => onClickCard(e, true)}
      >
        <div
          className={classNames(
            `${levelConfig.name}-card`,
            {
              highlight: isScrolledToElement,
              'outline-card-selected': blk.id === selectedContainerState?.currentId,
            },
          )}
          data-testid={testId ?? `${levelConfig.name}-card`}
          ref={currentRef}
        >
          {isHeaderVisible && (
            <>
              <CardHeader
                title={blk.displayName}
                status={blockStatus}
                cardId={blk.id}
                hasChanges={blk.hasChanges}
                renameSectionId={parentSection?.id ?? blk.id}
                renameSubsectionId={depth === 1 ? blk.id : depth === 2 ? (parentSubsection?.id ?? blk.id) : undefined}
                onClickPublish={() =>
                  openPublishModal({
                    value: liveBlock,
                    sectionId: parentSection?.id ?? blk.id,
                    ...(depth >= 2 ? { subsectionId: parentSubsection?.id ?? blk.id } : {}),
                  })}
                onClickConfigure={() =>
                  onOpenConfigureModal({
                    category: blk.category,
                    currentId: blk.id,
                    ...(depth >= 1 ? { subsectionId: blk.id } : {}),
                    ...(depth >= 2 ? { subsectionId: parentSubsection?.id ?? blk.id } : {}),
                    sectionId: parentSection?.id ?? blk.id,
                    index,
                  } as any)}
                onClickDelete={() =>
                  onOpenDeleteModal({
                    category: blk.category,
                    currentId: blk.id,
                    ...(depth >= 1 ? { subsectionId: blk.id } : {}),
                    ...(depth >= 2 ? { subsectionId: parentSubsection?.id ?? blk.id } : {}),
                    sectionId: parentSection?.id ?? blk.id,
                    index,
                  } as any)}
                onClickUnlink={() =>
                  openUnlinkModal({
                    value: liveBlock,
                    sectionId: parentSection?.id ?? blk.id,
                    ...(depth >= 2 ? { subsectionId: parentSubsection?.id ?? blk.id } : {}),
                  })}
                onClickMoveUp={handleMoveUp}
                onClickMoveDown={handleMoveDown}
                onClickSync={openSyncModal}
                onClickCard={(e) => onClickCard(e, true)}
                onClickDuplicate={() =>
                  duplicateMutation.mutate({
                    itemId: blk.id,
                    parentId: depth === 0
                      ? courseIDtoBlockID(courseId)
                      : depth === 1
                      ? parentSection?.id ?? blk.id
                      : parentSubsection?.id ?? blk.id,
                    sectionId: parentSection?.id ?? blk.id,
                    ...(depth >= 1 ? { subsectionId: depth === 1 ? blk.id : (parentSubsection?.id ?? blk.id) } : {}),
                  } as any)}
                onClickManageTags={handleClickManageTags}
                titleComponent={titleComponent}
                namePrefix={levelConfig.name}
                actions={actions}
                extraActionsComponent={extraActionsComponent}
                {...(depth === 1
                  ? { isSequential: true, proctoringExamConfigurationLink: blk.proctoringExamConfigurationLink }
                  : {})}
                {...(depth === 2 ?
                  {
                    isVertical: true,
                    enableCopyPasteUnits: blk.enableCopyPasteUnits ?? false,
                    onClickCopy: () => copyToClipboard(blk.id),
                    discussionEnabled: blk.discussionEnabled,
                    discussionsSettings,
                    parentInfo: {
                      graded: (parentSubsection as any)?.graded,
                      isTimeLimited: (parentSubsection as any)?.isTimeLimited,
                    },
                  } :
                  {})}
                readyToSync={blk.upstreamInfo?.readyToSync}
              />
              <div
                className={levelConfig.contentClass}
                data-testid={levelConfig.contentTestId}
                onClick={(e) => onClickCard(e, false)}
              >
                {depth === 0 && onOpenHighlightsModal && (
                  <div className="outline-section__status mb-1">
                    <Button
                      className="p-0 bg-transparent"
                      data-destid="section-card-highlights-button"
                      variant="tertiary"
                      onClick={() => onOpenHighlightsModal(liveBlock)}
                    >
                      <Bubble className="mr-1">{Number((blk.highlights as any[])?.length ?? 0)}</Bubble>
                      <p className="m-0 text-black">{sectionMessages.sectionHighlightsBadge.defaultMessage}</p>
                    </Button>
                  </div>
                )}
                <XBlockStatus
                  isSelfPaced={isSelfPaced}
                  isCustomRelativeDatesActive={isCustomRelativeDatesActive}
                  blockData={liveBlock}
                />
              </div>
            </>
          )}
          {depth < 2 && isExpanded && (
            <div
              data-testid={levelConfig.childContainerTestId}
              className={classNames(levelConfig.childContainerClass, {
                'item-children': isDraggable,
              })}
            >
              {children}
              {actions.childAddable && (
                <OutlineAddChildButtons
                  childType={levelConfig.containerType!}
                  parentLocator={blk.id}
                  grandParentLocator={depth === 1 ? parentSection?.id : undefined}
                />
              )}
              {showPaste && (
                <PasteComponent
                  className="mt-4 border-gray-500 rounded-0"
                  text={intl.formatMessage(subsectionMessages.pasteButton)}
                  clipboardData={sharedClipboardData}
                  onClick={() => onPasteClick?.(blk.id, blk.id, parentSection?.id ?? blk.id)}
                />
              )}
              {expandedExtra}
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

export default OutlineNode;
