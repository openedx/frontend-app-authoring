import type { KeyboardEvent, PointerEvent, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { Icon } from '@openedx/paragon';
import { DragHandle } from '@openedx/paragon/icons';
import { useStickyState } from '@src/hooks';

export const DEFAULT_SHARE = 0.5;
const MIN_PANEL_HEIGHT = 120; // px
const KEYBOARD_STEP = 0.05;

export const sanitizeShare = (value: unknown): number => (
  typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1 ? value : DEFAULT_SHARE
);

/**
 * Keeps both panels at least `minPanelHeight` tall. Bounds `share` to 0..1 while the
 * container is unmeasured (`availableHeight <= 0`), and returns an even split when both
 * minimums cannot fit.
 */
export const clampShare = (share: number, availableHeight: number, minPanelHeight: number): number => {
  if (availableHeight <= 0) {
    return Math.min(Math.max(share, 0), 1);
  }
  if (2 * minPanelHeight >= availableHeight) {
    return DEFAULT_SHARE;
  }
  const minShare = minPanelHeight / availableHeight;
  return Math.min(Math.max(share, minShare), 1 - minShare);
};

export interface ResizableSplitProps {
  top: ReactNode;
  bottom: ReactNode;
  storageKey: string;
  ariaLabel: string;
  minPanelHeight?: number;
  step?: number;
  className?: string;
}

/**
 * Stacks `top` and `bottom` around a horizontal separator that the user drags, or moves
 * with ArrowUp and ArrowDown, to trade height between the two. The share is the fraction
 * of the height given to the top panel, from 0 to 1, and is remembered in localStorage
 * under `storageKey`.
 */
export const ResizableSplit = ({
  top,
  bottom,
  storageKey,
  ariaLabel,
  minPanelHeight = MIN_PANEL_HEIGHT,
  step = KEYBOARD_STEP,
  className,
}: ResizableSplitProps) => {
  const [storedShare, setStoredShare] = useStickyState<unknown>(DEFAULT_SHARE, storageKey);
  const [share, setShare] = useState(() => sanitizeShare(storedShare));
  const [availableHeight, setAvailableHeight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartYRef = useRef(0);
  const dragStartShareRef = useRef(DEFAULT_SHARE);
  // Latest share set by a drag or key since the last commit, or null when nothing changed.
  const pendingShareRef = useRef<number | null>(null);
  const displayedShare = clampShare(share, availableHeight, minPanelHeight);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return undefined;
    }
    const measure = () => setAvailableHeight(root.clientHeight - (barRef.current?.offsetHeight ?? 0));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const updateShare = (next: number) => {
    if (pendingShareRef.current !== null || next !== displayedShare) {
      pendingShareRef.current = next;
    }
    setShare(next);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartYRef.current = event.clientY;
    dragStartShareRef.current = displayedShare;
    isDraggingRef.current = true;
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || availableHeight <= 0) {
      return;
    }
    const delta = (event.clientY - dragStartYRef.current) / availableHeight;
    updateShare(clampShare(dragStartShareRef.current + delta, availableHeight, minPanelHeight));
  };

  // Written on release only, so a drag does not hit localStorage on every move. A release
  // without a change leaves the stored preference alone, since the displayed share may be a
  // clamped version of it.
  const commit = () => {
    if (pendingShareRef.current === null) {
      return;
    }
    setStoredShare(pendingShareRef.current);
    pendingShareRef.current = null;
  };

  const handlePointerEnd = () => {
    if (!isDraggingRef.current) {
      return;
    }
    isDraggingRef.current = false;
    commit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
      return;
    }
    event.preventDefault();
    const delta = event.key === 'ArrowUp' ? -step : step;
    updateShare(clampShare((pendingShareRef.current ?? displayedShare) + delta, availableHeight, minPanelHeight));
  };

  const handleKeyUp = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      commit();
    }
  };

  return (
    <div ref={rootRef} className={classNames('resizable-split', className)}>
      <div className="resizable-split__pane" style={{ flexGrow: displayedShare }}>
        {top}
      </div>
      <div
        ref={barRef}
        className="resizable-split__bar"
        role="separator"
        aria-orientation="horizontal"
        aria-label={ariaLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(displayedShare * 100)}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onLostPointerCapture={handlePointerEnd}
      >
        <Icon src={DragHandle} size="xs" />
      </div>
      <div className="resizable-split__pane" style={{ flexGrow: 1 - displayedShare }}>
        {bottom}
      </div>
    </div>
  );
};
