import { type XBlock } from '@src/data/types';
import type {
  MoveDetails,
  SubsectionMoveDetails,
  UnitMoveDetails,
} from './utils';

/**
 * Commit callback type for reorder operations.
 * Uses variadic tuple rest to express both call signatures:
 * - 3 params: subsection reorder  (sectionId, prevSectionId, subsectionListIds)
 * - 4 params: unit reorder       (sectionId, prevSectionId, subsectionId, unitListIds)
 */
type ReorderCommitFn = (
  sectionId: string,
  prevSectionId: string,
  ...rest: [string[]] | [string, string[]]
) => void | Promise<void>;

/**
 * Apply a reorder from moveDetails and preview + commit.
 *
 * Handles both subsection and unit reorders. If moveDetails contains
 * `subsectionId` the unit commit signature is used; otherwise the
 * subsection commit signature is used.
 */
export function applyReorderMove(
  moveDetails: SubsectionMoveDetails | null,
  currentSection: XBlock,
  previewSections: (sections: XBlock[]) => void,
  commitReorder: ReorderCommitFn,
): void;
export function applyReorderMove(
  moveDetails: UnitMoveDetails | null,
  currentSection: XBlock,
  previewSections: (sections: XBlock[]) => void,
  commitReorder: ReorderCommitFn,
): void;
export function applyReorderMove(
  moveDetails: MoveDetails | null,
  currentSection: XBlock,
  previewSections: (sections: XBlock[]) => void,
  commitReorder: ReorderCommitFn,
): void {
  if (!moveDetails) { return; }
  const { fn, args, sectionId, subsectionId } = moveDetails;
  const [sectionsCopy, newItems] = fn(...args);
  if (!newItems || !sectionId) { return; }
  previewSections(sectionsCopy);
  const ids = newItems.map((s: XBlock) => s.id);
  if (subsectionId) {
    // Unit reorder
    commitReorder(sectionId, currentSection.id, subsectionId, ids);
  } else {
    // Subsection reorder
    commitReorder(sectionId, currentSection.id, ids);
  }
}
