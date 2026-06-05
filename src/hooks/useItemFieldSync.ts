import { useEffect, useRef } from 'react';

/**
 * Runs `effect` on every render after the first mount.
 *
 * The original pattern this replaces uses `didMountRef` + `useEffect` to
 * skip the initial mount. This hook preserves that first‑mount skip
 * behavior.
 *
 * NOTE: intentionally does **not** return `effect()` — the original pattern
 * discards cleanup by design. Returning it would cause React to call the
 * return value as a cleanup function on unmount, risking exceptions.
 */
export function useItemFieldSync(effect: () => void, deps: any[]): void {
  const didMountRef = useRef(false);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    effect();
  }, deps);
}
