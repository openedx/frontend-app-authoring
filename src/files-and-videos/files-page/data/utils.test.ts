import { updateFileValues, RawFile } from './utils';

// Minimal shape needed by updateFileValues: contentType (for wrapperType
// classification), dateAdded (the field under test), locked, usageLocations.
const buildFile = (overrides: Partial<RawFile> = {}): RawFile => ({
  id: 'file1',
  displayName: 'file1.txt',
  contentType: 'text/plain',
  dateAdded: 'Aug 13, 2023 at 22:08 UTC',
  locked: false,
  usageLocations: [],
  ...overrides,
});

describe('updateFileValues - dateAdded conversion', () => {
  it('converts dateAdded to a numeric epoch timestamp (getTime), not a string', () => {
    const [result] = updateFileValues([buildFile()]);

    // The whole point of the fix: dateAdded should now be a plain number
    // (milliseconds since epoch), not a Date.toString()-style string like
    // "Sun Aug 13 2023 22:08:00 GMT+0000 (Coordinated Universal Time)".
    expect(typeof result.dateAdded).toBe('number');
  });

  it('produces a dateAdded value that matches the actual parsed date', () => {
    const [result] = updateFileValues([buildFile({ dateAdded: 'Aug 13, 2023 at 22:08 UTC' })]);

    // 'at' is stripped by the function before parsing (mirrors the API's
    // "MMM dd, yyyy at HH:mm UTC" format), so this is the expected
    // ground-truth timestamp for that input string.
    const expected = new Date('Aug 13, 2023 22:08 UTC').getTime();
    expect(result.dateAdded).toBe(expected);
  });

  it('sorts correctly by dateAdded across different weekdays (regression test for the toString() weekday bug)', () => {
    // Tue Jun 02 2026 (older) vs Mon Jun 08 2026 (6 days newer).
    // Under the old `.toString()` implementation, string-comparing
    // "Tue Jun 02 2026..." vs "Mon Jun 08 2026..." incorrectly said the
    // older Tuesday file was "newer", because "Mon" < "Tue" alphabetically.
    // With getTime(), comparison is purely numeric and always chronological.
    const olderFile = buildFile({ id: 'oldFile', dateAdded: 'Jun 02, 2026 at 10:00 UTC' });
    const newerFile = buildFile({ id: 'newFile', dateAdded: 'Jun 08, 2026 at 10:00 UTC' });

    const [updatedOlder, updatedNewer] = updateFileValues([olderFile, newerFile]);

    expect(updatedOlder.dateAdded).toBeLessThan(updatedNewer.dateAdded);
  });

  it('produces equal dateAdded values for two files uploaded in the same minute', () => {
    // getTime() doesn't fix ties on its own, it just makes sure ties are
    // only ever real ties (identical timestamps), not false mismatches
    // caused by string formatting. Tie-breaking itself is handled
    // separately by the sortFiles comparator in generic/utils.js.
    const fileA = buildFile({ id: 'fileA', dateAdded: 'Jul 08, 2026 at 00:11 UTC' });
    const fileB = buildFile({ id: 'fileB', dateAdded: 'Jul 08, 2026 at 00:11 UTC' });

    const [updatedA, updatedB] = updateFileValues([fileA, fileB]);

    expect(updatedA.dateAdded).toBe(updatedB.dateAdded);
  });
});