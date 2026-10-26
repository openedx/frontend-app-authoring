import classNames from 'classnames';
import { useWindowSize } from '@openedx/paragon';
import { isRtl, useIntl } from '@edx/frontend-platform/i18n';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import messages from './messages';

const MIN_WIDTH = 440; // px
/** Pixels moved per arrow key press on the handle. Holding Shift multiplies this by four. */
const KEYBOARD_STEP = 16;
/** Set on `<body>` while a box is being dragged. Styled in `index.scss`. */
export const RESIZING_BODY_CLASS = 'resizable-resizing';

interface ResizableBoxProps {
  children: React.ReactNode;
  minWidth?: number;
  maxWidth?: number;
  /**
   * Width in pixels to render before the user resizes the box. Defaults to `minWidth`.
   * Always clamped to `[minWidth, maxWidth]`, so a stale persisted value cannot break the layout.
   */
  initialWidth?: number;
  /**
   * Called with the new width in pixels when the user finishes a drag or resizes with the
   * keyboard. Use it to persist the chosen width.
   */
  onResizeEnd?: (width: number) => void;
  /**
   * Accessible name of the drag handle. Screen readers announce it together with the
   * current width. Defaults to "Resize panel".
   */
  handleLabel?: string;
  /**
   * Which edge of the box the drag handle sits on, and which direction grows it, in a
   * left-to-right layout.
   * `'left'` (default): handle on the box's left edge, dragging right shrinks it. This
   * matches a box that sits on the right-hand side of a layout.
   * `'right'`: handle on the box's right edge, dragging right grows it. Use this for a
   * box that sits on the left-hand side of a layout, where the right edge is the
   * meaningful boundary to drag.
   * In a right-to-left locale the build's RTL stylesheet mirrors the layout, so the handle
   * sits on the opposite edge and the drag and arrow-key directions are mirrored to match.
   */
  handleSide?: 'left' | 'right';
  /**
   * When `true`, renders the box at `width: '100%'` and hides the drag
   * handle instead of using the pixel-based resizable width. Use this for a
   * layout where this box is temporarily the only column - e.g. before a
   * sibling column exists to resize against - so there's nothing meaningful
   * to drag. Defaults to `false`, preserving the normal resizable behavior.
   */
  fullWidth?: boolean;
  /**
   * When `true`, wraps `children` in a `width: 100%` div so content that
   * doesn't size itself (e.g. `CompetencyTree`) fills the box's own width
   * instead of shrinking to its own content width, as a flex row's default
   * `flex-basis: auto` would otherwise leave it. Defaults to `false`,
   * rendering `children` directly - required for a caller like `Sidebar.tsx`
   * whose own child (`.sidebar-content`) sets its own `flex`/`overflow`
   * CSS expecting to be a direct flex child of this box, which an added
   * wrapper div would break.
   */
  stretchContent?: boolean;
}

/**
 * Creates a resizable box that can be dragged to resize its width. The draggable handle
 * sits on the edge given by `handleSide` (defaults to the left edge).
 *
 * The handle follows the WAI-ARIA "window splitter" pattern: it is a focusable
 * `separator` that reports the current width through `aria-valuenow`, and the arrow keys,
 * Home and End resize the box without a mouse.
 *
 * The chosen width is clamped on every render, not only when it is set. When the window gets
 * narrower the box shrinks to the new maximum, and when the window grows again the chosen
 * width is restored.
 */
export const ResizableBox = ({
  children,
  minWidth = MIN_WIDTH,
  maxWidth,
  initialWidth,
  onResizeEnd,
  handleLabel,
  handleSide = 'left',
  fullWidth = false,
  stretchContent = false,
}: ResizableBoxProps) => {
  const intl = useIntl();
  const boxRef = useRef<HTMLDivElement>(null);
  // Whether moving the pointer (or pressing ArrowRight) towards the right grows the box. A
  // right-hand handle grows to the right in a left-to-right layout; a right-to-left locale
  // mirrors the layout, and with it the direction, so a left-hand handle grows to the right.
  const growsToTheRight = (handleSide === 'right') !== isRtl(intl.locale);
  const { width: windowWidth } = useWindowSize();

  const defaultMaxWidth = useMemo(() => {
    if (!windowWidth) {
      return Infinity;
    }
    return Math.abs(windowWidth * 0.65);
  }, [windowWidth]);
  const effectiveMaxWidth = Math.max(minWidth, maxWidth || defaultMaxWidth);

  const clampWidth = useCallback(
    (value: number) => Math.round(Math.min(Math.max(value, minWidth), effectiveMaxWidth)),
    [minWidth, effectiveMaxWidth],
  );

  // The width the user chose. It is clamped at render time rather than when stored, so a
  // temporarily narrow window does not overwrite the preference.
  const [width, setWidth] = useState<number>(initialWidth ?? minWidth);
  const renderedWidth = clampWidth(width);
  const [isResizing, setIsResizing] = useState(false);

  // Store the start values while dragging
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);
  // Removes the document listeners of the drag in progress, if any.
  const stopDragRef = useRef<(() => void) | null>(null);

  const commitWidth = useCallback((value: number) => {
    const next = clampWidth(value);
    setWidth(next);
    onResizeEnd?.(next);
  }, [clampWidth, onResizeEnd]);

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0 || stopDragRef.current) {
      return; // primary button only, one drag at a time
    }
    e.preventDefault(); // prevent text selection
    startXRef.current = e.clientX;
    // Start from the displayed width, not the stored preference: when the box is clamped by a
    // narrow window, starting from `width` would make the first part of the drag do nothing.
    startWidthRef.current = renderedWidth;
    let liveWidth = renderedWidth;

    const onMouseMove = (event: MouseEvent) => {
      const dx = event.clientX - startXRef.current; // positive = mouse moved right
      const rawWidth = growsToTheRight
        ? startWidthRef.current + dx
        : startWidthRef.current - dx;
      liveWidth = clampWidth(rawWidth);
      setWidth(liveWidth);
    };
    const onMouseUp = () => {
      stopDragRef.current?.();
      if (liveWidth !== startWidthRef.current) {
        onResizeEnd?.(liveWidth);
      }
    };
    const stopDrag = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      stopDragRef.current = null;
      setIsResizing(false);
    };

    // Attach listeners to the whole document so dragging works even outside the box
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    stopDragRef.current = stopDrag;
    setIsResizing(true);
  }, [renderedWidth, growsToTheRight, clampWidth, onResizeEnd]);

  // Remove the document listeners if the box unmounts during a drag (for example when the
  // panel it belongs to is closed).
  useEffect(() => () => {
    stopDragRef.current?.();
  }, []);

  // Mark the whole page while dragging, not only this box. An iframe anywhere under the
  // pointer (a content preview inside the sidebar, or one next to it on the unit page) would
  // otherwise receive the mouse events and the drag would stop. The cleanup also runs if the
  // box unmounts in the middle of a drag.
  useEffect(() => {
    if (!isResizing) {
      return undefined;
    }
    document.body.classList.add(RESIZING_BODY_CLASS);
    return () => document.body.classList.remove(RESIZING_BODY_CLASS);
  }, [isResizing]);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = KEYBOARD_STEP * (e.shiftKey ? 4 : 1);
    // The arrow pointing away from the box's content grows it, in either text direction.
    const growKey = growsToTheRight ? 'ArrowRight' : 'ArrowLeft';
    const shrinkKey = growsToTheRight ? 'ArrowLeft' : 'ArrowRight';
    let next: number;
    if (e.key === growKey) {
      next = renderedWidth + step;
    } else if (e.key === shrinkKey) {
      next = renderedWidth - step;
    } else if (e.key === 'Home') {
      next = minWidth;
    } else if (e.key === 'End') {
      next = effectiveMaxWidth;
    } else {
      return;
    }
    e.preventDefault();
    commitWidth(next);
  }, [growsToTheRight, renderedWidth, minWidth, effectiveMaxWidth, commitWidth]);

  return (
    <div
      className="resizable align-self-stretch d-flex"
      ref={boxRef}
      style={{ width: fullWidth ? '100%' : `${renderedWidth}px` }}
    >
      {!fullWidth && (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label={handleLabel ?? intl.formatMessage(messages.handleLabel)}
          aria-valuemin={minWidth}
          aria-valuemax={Number.isFinite(effectiveMaxWidth) ? Math.round(effectiveMaxWidth) : undefined}
          aria-valuenow={renderedWidth}
          aria-valuetext={intl.formatMessage(messages.handleValueText, { width: renderedWidth })}
          tabIndex={0}
          className={classNames('resizable-handle', { 'resizable-handle--right': handleSide === 'right' })}
          onMouseDown={onMouseDown}
          onKeyDown={onKeyDown}
        />
      )}
      {stretchContent ? <div className="w-100">{children}</div> : children}
    </div>
  );
};
