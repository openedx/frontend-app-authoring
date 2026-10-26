import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

// Hover intent: skips tooltips for a pointer merely passing over a row.
export const TOOLTIP_SHOW_DELAY_MS = 300;
// Lets the pointer travel from the trigger onto its tooltip; satisfies WCAG 1.4.13 (hoverable).
export const TOOLTIP_HIDE_DELAY_MS = 100;

/**
 * Show/hide state and timing for a tooltip that appears only when its trigger's
 * text is truncated. `isTruncated` is called each time the tooltip is about to
 * open, so widths changed since the last render are accounted for.
 */
export const useCompetencyTooltip = (isTruncated: () => boolean) => {
  const [show, setShow] = useState(false);
  const showTimer = useRef<ReturnType<typeof setTimeout>>();
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const isTruncatedRef = useRef(isTruncated);
  isTruncatedRef.current = isTruncated;

  const cancelShow = () => clearTimeout(showTimer.current);
  const cancelHide = useCallback(() => clearTimeout(hideTimer.current), []);

  const close = useCallback(() => {
    cancelShow();
    cancelHide();
    setShow(false);
  }, [cancelHide]);

  const closeSoon = useCallback(() => {
    cancelShow();
    cancelHide();
    hideTimer.current = setTimeout(close, TOOLTIP_HIDE_DELAY_MS);
  }, [cancelHide, close]);

  const openOnFocus = useCallback(() => {
    cancelShow();
    cancelHide();
    setShow(isTruncatedRef.current());
  }, [cancelHide]);

  const openOnHover = useCallback(() => {
    cancelShow();
    cancelHide();
    showTimer.current = setTimeout(() => setShow(isTruncatedRef.current()), TOOLTIP_SHOW_DELAY_MS);
  }, [cancelHide]);

  useEffect(() => () => {
    cancelShow();
    cancelHide();
  }, [cancelHide]);

  return {
    openOnHover,
    openOnFocus,
    close,
    closeSoon,
    /** Spread onto `CompetencyTooltip`. */
    tooltipProps: {
      show,
      onHide: close,
    },
  };
};
