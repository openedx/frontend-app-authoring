/**
 * OutlineNode — unified card renderer for all three outline levels.
 */
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bubble, Button, useToggle } from '@openedx/paragon';
import { useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import moment from 'moment';

import CardHeader from './card-header/CardHeader';
import SortableItem from './drag-helper/SortableItem';
import { DragContext } from './drag-helper/DragContextProvider';
import TitleButton from './card-header/TitleButton';
import TitleLink from './card-header/TitleLink';
import XBlockStatus from './xblock-status/XBlockStatus';
import { getItemStatus, getItemStatusBorder, scrollToElement } from './utils';
import { UpstreamInfoIcon } from '@src/generic/upstream-info-icon';
import { PreviewLibraryXBlockChanges } from '@src/course-unit/preview-changes';
import { invalidateLinksQuery } from '@src/course-libraries/data/apiHooks';
import { handleResponseErrors } from '@src/generic/saving-error-alert';
import { useClipboard, PasteComponent } from '@src/generic/clipboard';
import { useIntl } from '@edx/frontend-platform/i18n';
import type { XBlock, OutlineActionSelection } from '@src/data/types';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { useCourseOutlineContext } from './CourseOutlineContext';
import { useOutlineSidebarContext } from './outline-sidebar/OutlineSidebarContext';
import { courseOutlineQueryKeys } from './data/queryKeys';
import { useCourseItemData, useScrollState, useDuplicateItem } from './data';
import type { MoveDetails } from './drag-helper/utils';
import OutlineAddChildButtons from './OutlineAddChildButtons';
import CourseOutlineSubsectionCardExtraActionsSlot from '@src/plugin-slots/CourseOutlineSubsectionCardExtraActionsSlot';
import CourseOutlineUnitCardExtraActionsSlot from '@src/plugin-slots/CourseOutlineUnitCardExtraActionsSlot';
import outlineNodeMessages from './OutlineNode.messages';
import {
  type Depth,
  type OutlineNodeAncestors,
  getLevelConfig,
  buildSidebarOpenArgs,
  buildSelectionState,
  createOutlineNodeModel,
} from './outline-level';
import { useOutlineNodeExpansion } from './useOutlineNodeExpansion';

export interface OutlineNodeProps {
  block: XBlock;
  depth: Depth;
  index: number;
  isSelfPaced: boolean;
  isCustomRelativeDatesActive: boolean;
  isSectionsExpanded: boolean;
  getPossibleMoves?: (index: number, step: number) => MoveDetails | null;
  onOrderChange: (
    parentBlock: XBlock,
    moveDetails: MoveDetails | { oldIndex: number; newIndex: number; } | null,
  ) => void;
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
  // Tracks which ?show= locatorId we've already scrolled for, preventing
  // re-scroll on every re-render (sidebar selection, context changes, etc.)
  const scrolledToShowRef = useRef<string | null>(null);
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

  const levelConfig = getLevelConfig(depth);
  const blk = liveBlock as any;
  const initBlk = initialData as any;

  const ancestors: OutlineNodeAncestors = {
    section: parentSection || initialData,
    subsection: parentSubsection,
  };

  const model = createOutlineNodeModel({
    block: liveBlock,
    depth,
    index,
    ancestors,
    courseId,
    canMoveItem,
    getPossibleMoves,
  });

  const effectiveSection = model.effectiveSection;
  const isScrolledToElement = locatorId === blk.id;

  const shouldRenderUnit = model.shouldRender(blk.isHeaderVisible !== false);

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
  }, [effectiveSection.id, courseId, queryClient]);

  useEffect(() => {
    if (moment(initBlk.editedOnRaw).isAfter(moment(blk.editedOnRaw))) {
      queryClient.cancelQueries({
        queryKey: courseOutlineQueryKeys.courseItemId(initialData.id),
      }).catch((error) => console.error('Error cancelling query:', error));
      queryClient.setQueryData(courseOutlineQueryKeys.courseItemId(initialData.id), initialData);
    }
  }, [initBlk, blk, initialData, queryClient]);

  useEffect(() => {
    // One-shot: scroll for ?show= only once per locator value.
    // scrollState branch is independent (mutation-driven create/duplicate/paste).
    const shouldScrollToShow = isScrolledToElement && scrolledToShowRef.current !== locatorId;
    const shouldScrollToState = scrollState?.id === blk.id;

    if (currentRef.current && (shouldScrollToState || shouldScrollToShow)) {
      scrollToElement(currentRef.current, shouldScrollToShow, true);
      if (shouldScrollToShow) {
        scrolledToShowRef.current = locatorId;
      }
      if (shouldScrollToState) {
        resetScrollState().catch((error) => handleResponseErrors(error));
      }
    }
  }, [isScrolledToElement, scrollState, resetScrollState, blk.id, locatorId]);

  const isHeaderVisible = blk.isHeaderVisible !== false;

  const { isExpanded, setIsExpanded } = useOutlineNodeExpansion({
    depth,
    block: liveBlock,
    locatorId,
    isSectionsExpanded,
    isHeaderVisible,
    activeId,
    overId,
    scrollState,
  });

  const actions = model.actions();

  const blockStatus = getItemStatus({
    published: blk.published,
    visibilityState: blk.visibilityState,
    hasChanges: blk.hasChanges,
  });
  const borderStyle = getItemStatusBorder(depth < 2 && isExpanded ? undefined : blockStatus);

  const onClickCard = useCallback((e: React.MouseEvent, preventNodeEvents?: boolean) => {
    if (!preventNodeEvents || e.target === e.currentTarget) {
      const nodeAncestors: OutlineNodeAncestors = {
        section: parentSection || initialData,
        subsection: parentSubsection,
      };
      const args = buildSidebarOpenArgs(initialData, depth, index, nodeAncestors);
      openContainerSidebar(args.containerId, args.subsectionId, args.sectionId, args.index);
      if (depth < 2) { setIsExpanded(true); }
    }
  }, [depth, blk.id, index, openContainerSidebar, parentSection, parentSubsection, initialData]);

  const handleClickManageTags = useCallback(() => {
    const nodeAncestors: OutlineNodeAncestors = {
      section: parentSection || initialData,
      subsection: parentSubsection,
    };
    setSelectedContainerState(buildSelectionState(initialData, depth, index, nodeAncestors));
  }, [depth, blk.id, index, parentSection, parentSubsection, setSelectedContainerState, initialData]);

  const handleMoveUp = () => {
    if (depth === 0) { onOrderChange(initialData, { oldIndex: index, newIndex: index - 1 }); }
    else { onOrderChange(effectiveSection, getPossibleMoves!(index, -1)); }
  };
  const handleMoveDown = () => {
    if (depth === 0) { onOrderChange(initialData, { oldIndex: index, newIndex: index + 1 }); }
    else { onOrderChange(effectiveSection, getPossibleMoves!(index, 1)); }
  };

  const isDraggable = model.isDraggable(actions, isHeaderVisible);

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

  const isDroppable = model.isDroppable(actions);

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
                renameSectionId={model.renameSectionId}
                renameSubsectionId={model.renameSubsectionId}
                onClickPublish={() => openPublishModal(model.publishPayload(liveBlock))}
                onClickConfigure={() => onOpenConfigureModal(model.actionSelection())}
                onClickDelete={() => onOpenDeleteModal(model.actionSelection())}
                onClickUnlink={() => openUnlinkModal(model.unlinkPayload(liveBlock))}
                onClickMoveUp={handleMoveUp}
                onClickMoveDown={handleMoveDown}
                onClickSync={openSyncModal}
                onClickCard={(e) => onClickCard(e, true)}
                onClickDuplicate={() => duplicateMutation.mutate(model.duplicateParams())}
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
                      <p className="m-0 text-black">{outlineNodeMessages.sectionHighlightsBadge.defaultMessage}</p>
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
                  text={intl.formatMessage(outlineNodeMessages.pasteButton)}
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
