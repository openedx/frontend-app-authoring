import { useWindowSize } from '@openedx/paragon';
import classNames from 'classnames';
import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';

const MIN_WIDTH = 440; // px

interface ResizableBoxProps {
  children: React.ReactNode;
  minWidth?: number;
  maxWidth?: number;
  initialWidth?: number;
  storageKey?: string;
  className?: string;
  'data-testid'?: string;
}

/**
 * Creates a resizable box that can be dragged to resize the width from the left side.
 */
export const ResizableBox = ({
  children,
  minWidth = MIN_WIDTH,
  maxWidth,
  initialWidth,
  storageKey,
  className,
  'data-testid': dataTestId,
}: ResizableBoxProps) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(() => {
    if (storageKey) {
      const stored = window.localStorage.getItem(storageKey);
      if (stored !== null) {
        const parsed = Number(JSON.parse(stored));
        if (Number.isFinite(parsed)) { return parsed; }
      }
    }
    return initialWidth ?? minWidth;
  });
  const { width: windowWidth } = useWindowSize();

  // Persist width to localStorage when storageKey is set
  useEffect(() => {
    if (storageKey) {
      window.localStorage.setItem(storageKey, JSON.stringify(width));
    }
  }, [storageKey, width]);

  // Store the start values while dragging
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);
  const defaultMaxWidth = useMemo(() => {
    if (!windowWidth) {
      return Infinity;
    }
    return Math.abs(windowWidth * 0.65);
  }, [windowWidth]);

  // Clamp width when constraints change (e.g. window resize)
  useEffect(() => {
    setWidth((w) => Math.min(Math.max(w, minWidth), maxWidth || defaultMaxWidth));
  }, [minWidth, maxWidth, defaultMaxWidth]);

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
      className={classNames('resizable', className)}
      data-testid={dataTestId}
      ref={boxRef}
      style={{ width: `${width}px` }}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex, jsx-a11y/no-static-element-interactions */}
      <div className="resizable-handle" onMouseDown={onMouseDown} />
      <div className="w-100">
        {children}
      </div>
    </div>
  );
};
