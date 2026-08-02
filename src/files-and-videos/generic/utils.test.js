import { sortFiles } from './utils';

describe('sortFiles', () => {
  // Three files: file1 and file2 share an identical minute-precision
  // timestamp (simulating the real-world "uploaded back-to-back" case
  // from the bug report). file3 has a distinct, later timestamp, so we
  // can also confirm normal (non-tied) sorting still works correctly.
  const files = [
    { id: 'file1', displayName: 'a.txt', dateAdded: 'Jul 08, 2026, 12:11 AM' },
    { id: 'file2', displayName: 'b.txt', dateAdded: 'Jul 08, 2026, 12:11 AM' }, // tied with file1
    { id: 'file3', displayName: 'c.txt', dateAdded: 'Jul 08, 2026, 12:15 AM' }, // unique, newer
  ];

  it('flips tied files consistently along with the sort direction', () => {
    // Run the function once for "Newest first" and once for "Oldest first."
    const newest = sortFiles(files, 'dateAdded,desc');
    const oldest = sortFiles(files, 'dateAdded,asc');

    // file3 has the only unique/unambiguous timestamp, so its position
    // should be fully predictable: first when sorting newest-first,
    // last when sorting oldest-first. This confirms the "normal" (non-tied)
    // sorting path still works after the rewrite.
    expect(newest[0]).toBe('file3');
    expect(oldest[oldest.length - 1]).toBe('file3');

    // Now isolate just the tied pair (file1, file2) from each result,
    // filtering out file3 so we can compare their relative order to
    // each other in isolation.
    const tieOrderNewest = newest.filter(id => id !== 'file3');
    const tieOrderOldest = oldest.filter(id => id !== 'file3');

    // under the old code,reversing the descending array with .reverse() would flip ties
    // unpredictably run to run. Under my first attempted fix, tied files
    // were frozen in the same relative order regardless of direction,
    // which was also wrong, like file8/file9 wouldn't flip when toggled, even
    // though every other (non-tied) file did.
    //
    // Under the current code, the id-based tiebreaker is multiplied by directionMultiplier just like the primary comparison,
    // so tied files flip consistently along with the sort direction, same as any other pair of files. That means Oldest should always be
    // an exact, item-for-item reversal of Newest, ties included.
    expect(tieOrderNewest).toEqual([...tieOrderOldest].reverse());
  });
});