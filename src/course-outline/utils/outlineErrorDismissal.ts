/**
 * Iterate each dismissed-signature key where the base error still exists
 * and its current signature matches. The callback receives the key, the
 * matching signature, and the current error value.
 */
function forEachDismissedKey(
  baseErrors: Record<string, any>,
  dismissedSignatures: Record<string, string>,
  fn: (key: string, currentSig: string, currentError: any) => void,
): void {
  for (const key of Object.keys(dismissedSignatures)) {
    if (!(key in baseErrors)) {
      continue;
    }
    const currentError = baseErrors[key];
    if (currentError == null) {
      continue;
    }
    const currentSig = computeErrorSignature(currentError);
    if (currentSig === dismissedSignatures[key]) {
      fn(key, currentSig, currentError);
    }
  }
}

/**
 * Compute a stable signature for an error object.
 * Two errors with identical type/data/status/dismissible fields
 * produce the same signature. Returns 'null' for null/undefined input.
 */
export function computeErrorSignature(error: any): string {
  if (error == null) {
    return 'null';
  }
  const stable = {
    type: error.type,
    data: error.data,
    status: error.status,
    dismissible: error.dismissible,
  };
  return JSON.stringify(stable);
}

/**
 * Remove stale entries from the dismissed-signatures map.
 *
 * Drops a key K when:
 *   - baseErrors[K] is null (error cleared)
 *   - baseErrors[K] exists but its current signature differs from the stored one (error changed)
 *   - K is not present in baseErrors at all
 *
 * Returns a new map (shallow copy) with only still-valid entries.
 */
export function pruneDismissedErrorSignatures(
  baseErrors: Record<string, any>,
  dismissedSignatures: Record<string, string>,
): Record<string, string> {
  const pruned: Record<string, string> = {};

  forEachDismissedKey(baseErrors, dismissedSignatures, (key, currentSig) => {
    pruned[key] = currentSig;
  });

  return pruned;
}

/**
 * Build filtered errors object by applying dismissals.
 *
 * A dismissal for key K with signature S is applied only when:
 *   - baseErrors[K] is non-null
 *   - computeErrorSignature(baseErrors[K]) === S
 *
 * If the underlying error changed or cleared, the dismissal is
 * skipped so the new (or absent) error shows through naturally.
 */
export function filterDismissedErrors(
  baseErrors: Record<string, any>,
  dismissedSignatures: Record<string, string>,
): Record<string, any> {
  const filtered = { ...baseErrors };

  forEachDismissedKey(baseErrors, dismissedSignatures, (key) => {
    filtered[key] = null;
  });

  return filtered;
}
