import { type XBlock } from '@src/data/types';

/**
 * Apply a reorder from moveDetails and preview + commit.
 *
 * Handles both subsection and unit reorders. If moveDetails contains
 * `subsectionId` the unit commit signature is used; otherwise the
 * subsection commit signature is used.
 */
export function applyReorderMove(
  moveDetails: any,
  currentSection: XBlock,
  previewSections: (sections: XBlock[]) => void,
  commitReorder: (
    sectionId: string,
    prevSectionId: string,
    ...rest: any[]
  ) => void | Promise<void>,
) {
  const { fn, args, sectionId, subsectionId } = moveDetails as {
    fn: (...a: any[]) => any;
    args: any;
    sectionId: string;
    subsectionId?: string;
  };
  if (!args) { return; }
  const [sectionsCopy, newItems] = fn(...args);
  if (!newItems || !sectionId) { return; }
  previewSections(sectionsCopy);
  const ids = newItems.map((s: XBlock) => s.id);
  if (subsectionId) {
    // Unit reorder
    (commitReorder as any)(
      sectionId,
      currentSection.id,
      subsectionId,
      ids,
    );
  } else {
    // Subsection reorder
    (commitReorder as any)(
      sectionId,
      currentSection.id,
      ids,
    );
  }
}
