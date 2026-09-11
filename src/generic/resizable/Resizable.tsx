import classNames from 'classnames';
import { useWindowSize } from '@openedx/paragon';
import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';

const MIN_WIDTH = 440; // px

interface ResizableBoxProps {
  children: React.ReactNode;
  minWidth?: number;
  maxWidth?: number;
  /**
   * Which edge of the box the drag handle sits on, and which direction grows it.
   * `'left'` (default): handle on the box's left edge, dragging right shrinks it. This
   * matches a box that sits on the right-hand side of a layout.
   * `'right'`: handle on the box's right edge, dragging right grows it. Use this for a
   * box that sits on the left-hand side of a layout, where the right edge is the
   * meaningful boundary to drag.
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
}

/**
 * Creates a resizable box that can be dragged to resize its width. The draggable handle
 * sits on the edge given by `handleSide` (defaults to the left edge).
 */
export const ResizableBox = ({
  children,
  minWidth = MIN_WIDTH,
  maxWidth,
  handleSide = 'left',
  fullWidth = false,
}: ResizableBoxProps) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(minWidth); // initial width
  const { width: windowWidth } = useWindowSize();

  // Store the start values while dragging
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);
  const defaultMaxWidth = useMemo(() => {
    if (!windowWidth) {
      return Infinity;
    }
    return Math.abs(windowWidth * 0.65);
  }, [windowWidth]);

  const onMouseMove = useCallback((e: MouseEvent) => {
    const dx = e.clientX - startXRef.current; // positive = mouse moved right
    // Left handle: dragging right shrinks. Right handle: dragging right grows.
    const rawWidth = handleSide === 'right'
      ? startWidthRef.current + dx
      : startWidthRef.current - dx;
    const newWidth = Math.min(
      Math.max(rawWidth, minWidth),
      maxWidth || defaultMaxWidth,
    );
    setWidth(newWidth);
  }, [handleSide, maxWidth, minWidth, defaultMaxWidth]);

  const onMouseUp = useCallback(() => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }, [onMouseMove]);

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault(); // prevent text selection
    startXRef.current = e.clientX;
    startWidthRef.current = width;

    // Attach listeners to the whole document so dragging works even outside the box
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [width]);

  return (
    <div
      className="resizable align-self-stretch d-flex"
      ref={boxRef}
      style={{ width: fullWidth ? '100%' : `${width}px` }}
    >
      {!fullWidth && (
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex, jsx-a11y/no-static-element-interactions
        <div
          className={classNames('resizable-handle', { 'resizable-handle--right': handleSide === 'right' })}
          onMouseDown={onMouseDown}
        />
      )}
      <div className="w-100">
        {children}
      </div>
    </div>
  );
};
