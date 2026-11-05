/**
 * jsdom has no layout: every element's rect is zero, so dnd-kit's measuring and
 * the sortable keyboard coordinate getter cannot find a target. Give the
 * droppable nodes distinct rects, keyed by the `data-dnd-id` their wrapper
 * carries, and restore the prototype afterwards.
 *
 * Ascending, non-overlapping `[top, bottom]` pairs keep arrow-key direction
 * unambiguous (the stock getter filters by `top`).
 */
export type StubbedRect = [top: number, bottom: number];

export const stubRects = (rects: Record<string, StubbedRect>, width = 800): () => void => {
  const original = HTMLElement.prototype.getBoundingClientRect;

  HTMLElement.prototype.getBoundingClientRect = function getBoundingClientRect(this: HTMLElement) {
    // A droppable sits inside its data-dnd-id wrapper, which is where the
    // rect comes from; anything else dnd-kit measures during a drag falls back
    // to the focused card's row, which is where a keyboard drag keeps focus.
    const owner = this.closest<HTMLElement>('[data-dnd-id]')
      ?? document.activeElement?.closest<HTMLElement>('[data-dnd-id]')
      ?? null;
    const [top, bottom] = (owner?.dataset.dndId && rects[owner.dataset.dndId]) || [0, 0];
    return {
      top,
      bottom,
      height: bottom - top,
      left: 0,
      right: width,
      width,
      x: 0,
      y: top,
      toJSON: () => ({}),
    } as DOMRect;
  };

  return () => {
    HTMLElement.prototype.getBoundingClientRect = original;
  };
};
