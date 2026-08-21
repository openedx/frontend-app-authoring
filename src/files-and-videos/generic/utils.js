// Small helper: a standard three-way comparator.
// Returns -1 if a should come before b, 1 if a should come after b,
// and 0 if they're equal (a tie). This method prevents repetition in code for the primary sort and the tiebreaker sort.
// This is to help in the sorting of files in the sortFiles function below.
const compareValues = (a, b) => {
  if (a < b) { return -1; }
  if (a > b) { return 1; }
  return 0;
};

export const sortFiles = (files, sortType) => {
  // Same parsing as before(from old code): "dateAdded,desc" -> sort="dateAdded", direction="desc"
  const [sort, direction] = sortType.split(',');

  // Instead of hardcoding "always sort descending, then reverse if needed,"
  // we compute a multiplier that flips the comparator's sign directly.
  // Ascending (`asc`) uses 1 (normal order), descending uses -1 (inverted).
  // This means each direction gets its own independent sort
  const directionMultiplier = direction === 'asc' ? 1 : -1;

  // [...files] creates a shallow copy before sorting. The original code
  // called files.sort() directly, which mutates the array in place, which is
  // risky since `files` is Redux state passed down as a prop, and
  // mutating props/state directly can cause small, hard-to-trace bugs
  // somewhere else in the app. So, sorting a copy prevents that.
  const sortedFiles = [...files].sort((f1, f2) => {
    let primaryComparison;

    if (sort === 'displayName') {
      // Same case-insensitive handling as in old code, just now
      // through the shared compareValues() helper.
      primaryComparison = compareValues(f1[sort].toLowerCase(), f2[sort].toLowerCase());
    } else {
      // Handles dateAdded, fileSize, etc.
      primaryComparison = compareValues(f1[sort], f2[sort]);
    }

    // If the two files are genuinely different on the sort key
    // (e.g. different upload minute, different file size), we're done,
    // just apply the direction multiplier and return.
    if (primaryComparison !== 0) {
      return primaryComparison * directionMultiplier;
    }

    // Use ID to break the tie when two files have the same sort value.
    // Previously, before we did this, a bug caused inconsistent sorting when files had
    // similar timestamps.
    return compareValues(f1.id, f2.id) * directionMultiplier;
  });

  // Same as in old code: reduce down to just the ordered list of IDs.
  return sortedFiles.map(file => file.id);

  // No reverse() call anymore as both directions were already computed above.
};
