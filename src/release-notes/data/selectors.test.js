import {
  getReleaseNotes, getSavingStatuses, getLoadingStatuses, getErrors,
} from './selectors';

describe('release-notes selectors', () => {
  const state = {
    releaseNotes: {
      releaseNotes: [{ id: 1 }],
      savingStatuses: { createReleaseNoteQuery: 'PENDING' },
      loadingStatuses: { fetchReleaseNotesQuery: 'IN_PROGRESS' },
      errors: { loadingNotes: false },
    },
  };

  test('getReleaseNotes', () => {
    expect(getReleaseNotes(state)).toEqual([{ id: 1 }]);
  });

  test('getSavingStatuses', () => {
    expect(getSavingStatuses(state)).toEqual({ createReleaseNoteQuery: 'PENDING' });
  });

  test('getLoadingStatuses', () => {
    expect(getLoadingStatuses(state)).toEqual({ fetchReleaseNotesQuery: 'IN_PROGRESS' });
  });

  test('getErrors', () => {
    expect(getErrors(state)).toEqual({ loadingNotes: false });
  });

  test('selectors throw or return undefined for missing slice', () => {
    const bad = {};
    expect(() => getReleaseNotes(bad)).toThrow();
  });

  test('selectors with populated state return exact references', () => {
    const rn = [{ id: 9 }];
    const saving = { createReleaseNoteQuery: 'SUCCESSFUL' };
    const loading = { fetchReleaseNotesQuery: 'SUCCESSFUL' };
    const errors = { loadingNotes: false };
    const st = {
      releaseNotes: {
        releaseNotes: rn, savingStatuses: saving, loadingStatuses: loading, errors,
      },
    };
    expect(getReleaseNotes(st)).toBe(rn);
    expect(getSavingStatuses(st)).toBe(saving);
    expect(getLoadingStatuses(st)).toBe(loading);
    expect(getErrors(st)).toBe(errors);
  });
});
