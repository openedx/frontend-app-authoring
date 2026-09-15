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
}

/**
 * Creates a resizable box that can be dragged to resize the width from the left side.
 */
export const ResizableBox = ({
  children,
  minWidth = MIN_WIDTH,
  maxWidth,
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

  /*
   * `width` is the width the user dragged to, which may no longer fit once the
   * window is narrowed. Clamp it on every render so the box shrinks with the
   * viewport instead of overflowing its flex row and painting over the page
   * content. The preferred width stays in state, so it is restored when the
   * window is widened again.
   */
  const effectiveWidth = useMemo(
    () => Math.min(width, Math.max(minWidth, maxWidth || defaultMaxWidth)),
    [width, minWidth, maxWidth, defaultMaxWidth],
  );

  const onMouseMove = useCallback((e: MouseEvent) => {
    const dx = e.clientX - startXRef.current; // positive = mouse moved right
    const newWidth = Math.min(
      Math.max(startWidthRef.current - dx, minWidth),
      maxWidth || defaultMaxWidth,
    );
    setWidth(newWidth);
  }, [maxWidth, minWidth, defaultMaxWidth]);

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
      style={{ width: `${effectiveWidth}px` }}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex, jsx-a11y/no-static-element-interactions */}
      <div className="resizable-handle" onMouseDown={onMouseDown} />
      <div className="w-100 d-flex">
        {children}
      </div>
    </div>
  );
};
