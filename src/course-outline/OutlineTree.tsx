import { useCallback, type ReactNode } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ContainerType } from '@src/generic/key-utils';
import type { OutlineActionSelection, XBlock, XBlockActions } from '@src/data/types';

import OutlineNode from './OutlineNode';
import EmptyPlaceholder from './empty-placeholder/EmptyPlaceholder';
import OutlineAddChildButtons from './OutlineAddChildButtons';
import DraggableList from './drag-helper/DraggableList';
import {
  canMoveSection,
  possibleUnitMoves,
  possibleSubsectionMoves,
  type SubsectionMoveDetails,
  type UnitMoveDetails,
} from './drag-helper/utils';
import { applyReorderMove } from './drag-helper/utils';
import { type Depth, LEVEL_NAMES } from './outline-level';

export interface OutlineTreeProps {
  sections: XBlock[];
  courseActions: XBlockActions;
  courseUsageKey: string;
  hasOutlineIndexError: boolean;
  isCustomRelativeDatesActive: boolean;
  isSectionsExpanded: boolean;
  isSelfPaced: boolean;
  discussionsSettings: { providerType: string; enableGradedUnits: boolean; };
  previewSections: (nextSections: XBlock[]) => void;
  cancelReorderPreview: () => void;
  commitSectionReorder: (sectionListIds: string[]) => Promise<void>;
  commitSubsectionReorder: (
    sectionId: string,
    prevSectionId: string,
    subsectionListIds: string[],
  ) => Promise<void>;
  commitUnitReorder: (
    sectionId: string,
    prevSectionId: string,
    subsectionId: string,
    unitListIds: string[],
  ) => Promise<void>;
  handleOpenHighlightsModal: (section: XBlock) => void;
  openConfigureModal: (selection: OutlineActionSelection) => void;
  openDeleteModal: (selection: OutlineActionSelection) => void;
  handlePasteClipboardClick: (parentLocator: string, subsectionId: string, sectionId: string) => void;
}

interface RenderContext {
  section: XBlock;
  sectionIndex: number;
  subsection?: XBlock;
  subsectionIndex?: number;
}

const OutlineTree = ({
  sections,
  courseActions,
  courseUsageKey,
  hasOutlineIndexError,
  isCustomRelativeDatesActive,
  isSectionsExpanded,
  isSelfPaced,
  discussionsSettings,
  previewSections,
  cancelReorderPreview,
  commitSectionReorder,
  commitSubsectionReorder,
  commitUnitReorder,
  handleOpenHighlightsModal,
  openConfigureModal,
  openDeleteModal,
  handlePasteClipboardClick,
}: OutlineTreeProps) => {
  const handleSectionOrderChange = useCallback(async (oldIndex: number, newIndex: number) => {
    if (oldIndex === newIndex) { return; }
    const nextSections = arrayMove(sections, oldIndex, newIndex) as XBlock[];
    const sectionListIds = nextSections.map((s) => s.id);
    previewSections(nextSections);
    await commitSectionReorder(sectionListIds);
  }, [sections, previewSections, commitSectionReorder]);

  const handleSubsectionOrderChange = useCallback(
    async (section: XBlock, moveDetails: SubsectionMoveDetails | null) => {
      applyReorderMove(moveDetails, section, previewSections, commitSubsectionReorder);
    },
    [previewSections, commitSubsectionReorder],
  );

  const handleUnitOrderChange = useCallback(async (section: XBlock, moveDetails: UnitMoveDetails | null) => {
    applyReorderMove(moveDetails, section, previewSections, commitUnitReorder);
  }, [previewSections, commitUnitReorder]);

  const renderNode = (block: XBlock, index: number, depth: Depth, ctx: RenderContext): ReactNode => {
    const children = depth < 2 ? (block.childInfo?.children ?? []) : [];

    const canMove = depth === 0 ? canMoveSection(sections) : undefined;

    const getPossibleMoves = depth === 0 ?
      undefined
      : depth === 1 ?
      possibleSubsectionMoves(
        [...sections],
        ctx.sectionIndex,
        ctx.section,
        ctx.section.childInfo.children,
      )
      : possibleUnitMoves(
        [...sections],
        ctx.sectionIndex,
        ctx.subsectionIndex!,
        ctx.section,
        ctx.subsection!,
        ctx.subsection!.childInfo.children,
      );

    const orderHandler = depth === 0
      ? (_blk: XBlock, d: { oldIndex: number; newIndex: number; }) => handleSectionOrderChange(d.oldIndex, d.newIndex)
      : depth === 1 ?
      handleSubsectionOrderChange
      : handleUnitOrderChange;

    return (
      <OutlineNode
        key={block.id}
        block={block}
        depth={depth}
        index={index}
        isSelfPaced={isSelfPaced}
        isCustomRelativeDatesActive={isCustomRelativeDatesActive}
        isSectionsExpanded={isSectionsExpanded}
        onOpenConfigureModal={openConfigureModal}
        onOpenDeleteModal={openDeleteModal}
        onOpenHighlightsModal={depth === 0 ? handleOpenHighlightsModal : undefined}
        canMoveItem={canMove}
        getPossibleMoves={getPossibleMoves}
        onOrderChange={orderHandler}
        section={depth === 0 ? block : ctx.section}
        subsection={depth >= 2 ? ctx.subsection : undefined}
        onPasteClick={depth === 1 ? handlePasteClipboardClick : undefined}
        discussionsSettings={depth === 2 ? discussionsSettings : undefined}
        testId={`${LEVEL_NAMES[depth]}-card`}
      >
        {depth < 2 && (
          <SortableContext id={block.id} items={children} strategy={verticalListSortingStrategy}>
            {children.map((child, i) => {
              const childCtx: RenderContext = {
                section: ctx.section,
                sectionIndex: ctx.sectionIndex,
                subsection: depth === 0 ? child : ctx.subsection,
                subsectionIndex: depth === 0 ? i : ctx.subsectionIndex,
              };
              return renderNode(child, i, (depth + 1) as Depth, childCtx);
            })}
          </SortableContext>
        )}
      </OutlineNode>
    );
  };

  return (
    <section>
      {!hasOutlineIndexError && (
        <div className="pt-4">
          {sections.length ?
            (
              <>
                <DraggableList
                  items={sections}
                  onPreviewTreeChange={previewSections}
                  onCancelDrag={cancelReorderPreview}
                  onSectionDrop={commitSectionReorder}
                  onSubsectionDrop={commitSubsectionReorder}
                  onUnitDrop={commitUnitReorder}
                >
                  <SortableContext id="root" items={sections} strategy={verticalListSortingStrategy}>
                    {sections.map((section, sectionIndex) =>
                      renderNode(section, sectionIndex, 0, { section, sectionIndex })
                    )}
                  </SortableContext>
                </DraggableList>
                {courseActions.childAddable && (
                  <OutlineAddChildButtons
                    childType={ContainerType.Section}
                    parentLocator={courseUsageKey}
                  />
                )}
              </>
            ) :
            (
              <EmptyPlaceholder>
                {courseActions.childAddable ?
                  (
                    <OutlineAddChildButtons
                      childType={ContainerType.Section}
                      parentLocator={courseUsageKey}
                      btnVariant="primary"
                      btnClasses="mt-1"
                    />
                  ) :
                  <></>}
              </EmptyPlaceholder>
            )}
        </div>
      )}
    </section>
  );
};

export default OutlineTree;
