/**
 * Fired when a subsection row in a `CourseOutlineSubtree` is activated
 * (click, or Enter/Space while focused).
 *
 * Mirrors `ComponentSelectedEvent`'s shape from
 * `src/library-authoring/common/context/ComponentPickerContext.tsx`, but is
 * defined locally here since this is a plain prop passed down through one
 * panel, not a cross-route React context.
 */
export type SubsectionSelectedEvent = (selected: { usageKey: string; blockType: string; }) => void;
