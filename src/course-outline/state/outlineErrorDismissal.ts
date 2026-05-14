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
 * Build filtered errors object by applying dismissals.
 *
 * A dismissal for key K with signature S is applied only when:
 *   - baseErrors[K] is non-null
 *   - computeSignature(baseErrors[K]) === S
 *
 * If the underlying error changed or cleared, the dismissal is
 * skipped so the new (or absent) error shows through naturally.
 */
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
  computeSignature: (error: any) => string = computeErrorSignature,
): Record<string, string> {
  const pruned: Record<string, string> = {};

  for (const key of Object.keys(dismissedSignatures)) {
    if (!(key in baseErrors)) {
      // Key no longer exists in error state – drop.
      continue;
    }
    const currentError = baseErrors[key];
    if (currentError == null) {
      // Error cleared – drop.
      continue;
    }
    const currentSig = computeSignature(currentError);
    if (currentSig !== dismissedSignatures[key]) {
      // Error changed – drop.
      continue;
    }
    // Error still matches – keep.
    pruned[key] = dismissedSignatures[key];
  }

  return pruned;
}

export function filterDismissedErrors(
  baseErrors: Record<string, any>,
  dismissedSignatures: Record<string, string>,
  computeSignature: (error: any) => string = computeErrorSignature,
): Record<string, any> {
  const filtered = { ...baseErrors };

  for (const key of Object.keys(dismissedSignatures)) {
    if (!(key in baseErrors)) {
      continue;
    }
    const currentError = baseErrors[key];
    if (currentError == null) {
      // Error cleared – dismissal is stale, don't apply.
      continue;
    }
    const currentSig = computeSignature(currentError);
    if (currentSig === dismissedSignatures[key]) {
      // Same error instance – keep it dismissed.
      filtered[key] = null;
    }
    // If signature differs, the error changed – let it show.
  }

  return filtered;
}
