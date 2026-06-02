import { useCallback } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ContainerType } from '@src/generic/key-utils';
import type { OutlineActionSelection, XBlock, XBlockActions } from '@src/data/types';

import SectionCard from './section-card/SectionCard';
import SubsectionCard from './subsection-card/SubsectionCard';
import UnitCard from './unit-card/UnitCard';
import EmptyPlaceholder from './empty-placeholder/EmptyPlaceholder';
import OutlineAddChildButtons from './OutlineAddChildButtons';
import DraggableList from './drag-helper/DraggableList';
import {
  canMoveSection,
  possibleUnitMoves,
  possibleSubsectionMoves,
} from './drag-helper/utils';
import {
  applySubsectionReorderMove,
  applyUnitReorderMove,
} from './drag-helper/reorderHelpers';

export interface OutlineTreeProps {
  sections: XBlock[];
  courseActions: XBlockActions;
  courseUsageKey: string;
  hasOutlineIndexError: boolean;
  isCustomRelativeDatesActive: boolean;
  isSectionsExpanded: boolean;
  isSelfPaced: boolean;
  discussionsSettings: { providerType: string; enableGradedUnits: boolean };
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
  // ─── Card order change handlers (preview + commit) ────────────────────
  const handleSectionOrderChange = useCallback(async (oldIndex: number, newIndex: number) => {
    if (oldIndex === newIndex) { return; }
    const nextSections = arrayMove(sections, oldIndex, newIndex) as XBlock[];
    const sectionListIds = nextSections.map((s) => s.id);
    previewSections(nextSections);
    await commitSectionReorder(sectionListIds);
  }, [sections, previewSections, commitSectionReorder]);

  const handleSubsectionOrderChange = useCallback(async (section: XBlock, moveDetails: any) => {
    applySubsectionReorderMove(moveDetails, section, previewSections, commitSubsectionReorder);
  }, [previewSections, commitSubsectionReorder]);

  const handleUnitOrderChange = useCallback(async (section: XBlock, moveDetails: any) => {
    applyUnitReorderMove(moveDetails, section, previewSections, commitUnitReorder);
  }, [previewSections, commitUnitReorder]);

  return (<section>
    {!hasOutlineIndexError && (
      <div className="pt-4">
        {sections.length ? (
          <>
            <DraggableList
              items={sections}
              onPreviewTreeChange={previewSections}
              onCancelDrag={cancelReorderPreview}
              onSectionDrop={commitSectionReorder}
              onSubsectionDrop={commitSubsectionReorder}
              onUnitDrop={commitUnitReorder}
            >
              <SortableContext
                id="root"
                items={sections}
                strategy={verticalListSortingStrategy}
              >
                {sections.map((section, sectionIndex) => (
                  <SectionCard
                    key={section.id}
                    section={section}
                    index={sectionIndex}
                    canMoveItem={canMoveSection(sections)}
                    isSelfPaced={isSelfPaced}
                    isCustomRelativeDatesActive={isCustomRelativeDatesActive}
                    onOpenHighlightsModal={handleOpenHighlightsModal}
                    onOpenConfigureModal={openConfigureModal}
                    onOpenDeleteModal={openDeleteModal}
                    isSectionsExpanded={isSectionsExpanded}
                    onOrderChange={handleSectionOrderChange}
                  >
                    <SortableContext
                      id={section.id}
                      items={section.childInfo.children}
                      strategy={verticalListSortingStrategy}
                    >
                      {section.childInfo.children.map((subsection, subsectionIndex) => (
                        <SubsectionCard
                          key={subsection.id}
                          section={section}
                          subsection={subsection}
                          index={subsectionIndex}
                          getPossibleMoves={possibleSubsectionMoves(
                            [...sections],
                            sectionIndex,
                            section,
                            section.childInfo.children,
                          )}
                          isSectionsExpanded={isSectionsExpanded}
                          isSelfPaced={isSelfPaced}
                          isCustomRelativeDatesActive={isCustomRelativeDatesActive}
                          onOpenDeleteModal={openDeleteModal}
                          onOpenConfigureModal={openConfigureModal}
                          onOrderChange={handleSubsectionOrderChange}
                          onPasteClick={handlePasteClipboardClick}
                        >
                          <SortableContext
                            id={subsection.id}
                            items={subsection.childInfo.children}
                            strategy={verticalListSortingStrategy}
                          >
                            {subsection.childInfo.children.map((unit, unitIndex) => (
                              <UnitCard
                                key={unit.id}
                                unit={unit}
                                subsection={subsection}
                                section={section}
                                isSelfPaced={isSelfPaced}
                                isCustomRelativeDatesActive={isCustomRelativeDatesActive}
                                index={unitIndex}
                                getPossibleMoves={possibleUnitMoves(
                                  [...sections],
                                  sectionIndex,
                                  subsectionIndex,
                                  section,
                                  subsection,
                                  subsection.childInfo.children,
                                )}
                                onOpenConfigureModal={openConfigureModal}
                                onOpenDeleteModal={openDeleteModal}
                                onOrderChange={handleUnitOrderChange}
                                discussionsSettings={discussionsSettings}
                              />
                            ))}
                          </SortableContext>
                        </SubsectionCard>
                      ))}
                    </SortableContext>
                  </SectionCard>
                ))}
              </SortableContext>
            </DraggableList>
            {courseActions.childAddable && (
              <OutlineAddChildButtons
                childType={ContainerType.Section}
                parentLocator={courseUsageKey}
              />
            )}
          </>
        ) : (
          <EmptyPlaceholder>
            {courseActions.childAddable ? (
              <OutlineAddChildButtons
                childType={ContainerType.Section}
                parentLocator={courseUsageKey}
                btnVariant="primary"
                btnClasses="mt-1"
              />
            ) : (
              <></>
            )}
          </EmptyPlaceholder>
        )}
      </div>
    )}
  </section>
  );
};

export default OutlineTree;
