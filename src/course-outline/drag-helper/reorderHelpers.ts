import { type XBlock } from '@src/data/types';

/**
 * Apply a subsection reorder from moveDetails and preview + commit.
 *
 * Shared between OutlineTree (drag drop) and SubsectionInfoSidebar (menu move).
 */
export function applySubsectionReorderMove(
  moveDetails: any,
  currentSection: XBlock,
  previewSections: (sections: XBlock[]) => void,
  commitSubsectionReorder: (
    sectionId: string,
    prevSectionId: string,
    subsectionListIds: string[],
  ) => void | Promise<void>,
) {
  const { fn, args, sectionId } = moveDetails as {
    fn: (...a: any[]) => any;
    args: any;
    sectionId: string;
  };
  if (!args) { return; }
  const [sectionsCopy, newSubsections] = fn(...args);
  if (newSubsections && sectionId) {
    previewSections(sectionsCopy);
    commitSubsectionReorder(
      sectionId,
      currentSection.id,
      newSubsections.map((s: XBlock) => s.id),
    );
  }
}

/**
 * Apply a unit reorder from moveDetails and preview + commit.
 *
 * Shared between OutlineTree (drag drop) and UnitInfoSidebar (menu move).
 */
export function applyUnitReorderMove(
  moveDetails: any,
  currentSection: XBlock,
  previewSections: (sections: XBlock[]) => void,
  commitUnitReorder: (
    sectionId: string,
    prevSectionId: string,
    subsectionId: string,
    unitListIds: string[],
  ) => void | Promise<void>,
) {
  const { fn, args, sectionId, subsectionId } = moveDetails as {
    fn: (...a: any[]) => any;
    args: any;
    sectionId: string;
    subsectionId: string;
  };
  if (!args) { return; }
  const [sectionsCopy, newUnits] = fn(...args);
  if (newUnits && subsectionId) {
    previewSections(sectionsCopy);
    commitUnitReorder(
      sectionId,
      currentSection.id,
      subsectionId,
      newUnits.map((u: XBlock) => u.id),
    );
  }
}
