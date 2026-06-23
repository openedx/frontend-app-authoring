import { useCallback, useEffect, useRef, useState } from 'react';
import { isEqual } from 'lodash';

export type DraftUpdater<T> = (patch: Partial<T> | ((prev: T) => T)) => void;

/**
 * Draft-overlay state for auto-saving settings panels.
 *
 * React Query (or props) remain the single source of truth. `useFieldDraft`
 * keeps a local `override` ONLY while the user has an uncommitted edit, so the
 * displayed value is `override ?? serverValue`. Any external change to
 * `serverValue` (e.g. the outline configure modal) is therefore reflected
 * immediately whenever the user has no edit in flight — which is the bug the
 * previous `useStateWithCallback` + `useItemFieldSync` pattern could not fix
 * without either going stale or clobbering an in-progress edit.
 *
 * Lifecycle of the override:
 *  - set when the user edits a field (instant, responsive);
 *  - committed via `commit` after a debounce (`delay`);
 *  - retired when fresh `serverValue` equals it (our own commit landed) OR when
 *    `serverValue` changes while no edit is pending (external/normalized update);
 *  - reverted immediately if the commit promise rejects.
 *
 * An in-flight (debouncing or saving) edit is never overwritten by a refetch.
 *
 * NOTE: `serverValue` must be referentially stable across renders unless its
 * underlying fields actually change (memoize it), otherwise the reconcile
 * effect runs every render.
 */
export function useFieldDraft<T extends object>(
  serverValue: T,
  commit: (value: T) => Promise<unknown> | void,
  delay = 500,
): [T, DraftUpdater<T>] {
  const [override, setOverride] = useState<T | null>(null);
  const value = override ?? serverValue;

  const valueRef = useRef(value);
  valueRef.current = value;
  // True while the user has an edit that has not finished committing.
  const pendingRef = useRef(false);
  // The most recent draft scheduled for commit (used to ignore superseded commits).
  const latestRef = useRef<T | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const commitRef = useRef(commit);
  commitRef.current = commit;

  // Retire the override once the server reflects our edit, or whenever the
  // server changes while the user has no edit in flight (external update).
  useEffect(() => {
    if (override === null) {
      return;
    }
    if (isEqual(serverValue, override) || !pendingRef.current) {
      setOverride(null);
    }
  }, [serverValue, override]);

  // Cancel any pending commit on unmount.
  useEffect(() => () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const update = useCallback<DraftUpdater<T>>((patch) => {
    const base = valueRef.current;
    const next = typeof patch === 'function' ? patch(base) : { ...base, ...patch };
    pendingRef.current = true;
    latestRef.current = next;
    setOverride(next);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      const committed = latestRef.current as T;
      Promise.resolve(commitRef.current(committed))
        .catch(() => {
          // Commit failed: drop the override so the panel shows real server state,
          // unless a newer edit has already superseded this one.
          if (latestRef.current === committed) {
            setOverride((curr) => (curr === committed ? null : curr));
          }
        })
        .finally(() => {
          if (latestRef.current === committed) {
            pendingRef.current = false;
          }
        });
    }, delay);
  }, [delay]);

  return [value, update];
}
