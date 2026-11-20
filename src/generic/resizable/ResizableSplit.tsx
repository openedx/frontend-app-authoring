import type { KeyboardEvent, ReactNode } from 'react';
import { useState } from 'react';
import classNames from 'classnames';
import { Icon } from '@openedx/paragon';
import { DragHandle } from '@openedx/paragon/icons';

export const DEFAULT_SHARE = 0.5;
const MIN_PANEL_HEIGHT = 120; // px
const KEYBOARD_STEP = 0.05;

export const sanitizeShare = (value: unknown): number => (
  typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1 ? value : DEFAULT_SHARE
);

/**
 * Keeps both panels at least `minPanelHeight` tall. Returns `share` unchanged while the
 * container is unmeasured (`availableHeight <= 0`), and an even split when both
 * minimums cannot fit.
 */
export const clampShare = (share: number, availableHeight: number, minPanelHeight: number): number => {
  if (availableHeight <= 0) {
    return share;
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
 * Stacks `top` and `bottom` panels around a horizontal separator. The share is the
 * fraction of the height given to the top panel, from 0 to 1, and the separator is
 * operable with ArrowUp and ArrowDown.
 */
export const ResizableSplit = ({
  top,
  bottom,
  ariaLabel,
  minPanelHeight = MIN_PANEL_HEIGHT,
  step = KEYBOARD_STEP,
  className,
}: ResizableSplitProps) => {
  const [share, setShare] = useState(DEFAULT_SHARE);
  const availableHeight = 0;
  const displayedShare = clampShare(share, availableHeight, minPanelHeight);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
      return;
    }
    event.preventDefault();
    const delta = event.key === 'ArrowUp' ? -step : step;
    setShare(clampShare(displayedShare + delta, availableHeight, minPanelHeight));
  };

  return (
    <div className={classNames('resizable-split', className)}>
      <div className="resizable-split__pane" style={{ flexGrow: displayedShare }}>
        {top}
      </div>
      <div
        className="resizable-split__bar"
        role="separator"
        aria-orientation="horizontal"
        aria-label={ariaLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(displayedShare * 100)}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <Icon src={DragHandle} size="xs" />
      </div>
      <div className="resizable-split__pane" style={{ flexGrow: 1 - displayedShare }}>
        {bottom}
      </div>
    </div>
  );
};
