import type { FocusEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

// Hover intent: skips tooltips for a pointer merely passing over a row.
export const TOOLTIP_SHOW_DELAY_MS = 300;

/**
 * Show/hide state and timing for a tooltip that appears only when its trigger's
 * text is truncated. `isTruncated` is called each time the tooltip is about to
 * open, so widths changed since the last render are accounted for.
 *
 * Paragon's `OverlayTrigger` is not used because it renders the overlay as a
 * sibling and checks DOM containment, so it cannot keep a portaled tooltip open
 * while the pointer is on it.
 */
export const useCompetencyTooltip = (isTruncated: () => boolean) => {
  const [show, setShow] = useState(false);
  const showTimer = useRef<ReturnType<typeof setTimeout>>();
  const isTruncatedRef = useRef(isTruncated);
  isTruncatedRef.current = isTruncated;

  const cancelShow = () => clearTimeout(showTimer.current);

  const close = () => {
    cancelShow();
    setShow(false);
  };

  const openOnFocus = (event: FocusEvent<HTMLElement>) => {
    // Pointer focus is skipped: pointer users get the tooltip through the hover delay.
    if (!event.currentTarget.matches(':focus-visible')) { return; }
    cancelShow();
    setShow(isTruncatedRef.current());
  };

  const openOnHover = () => {
    cancelShow();
    showTimer.current = setTimeout(() => setShow(isTruncatedRef.current()), TOOLTIP_SHOW_DELAY_MS);
  };

  useEffect(() => () => clearTimeout(showTimer.current), []);

  return {
    openOnHover,
    openOnFocus,
    close,
    /** Spread onto `CompetencyTooltip`. */
    tooltipProps: {
      show,
      onHide: close,
    },
  };
};
