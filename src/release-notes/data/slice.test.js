import {
  reducer,
  fetchReleaseNotesSuccess,
  createReleaseNote,
  editReleaseNote,
  deleteReleaseNote,
  updateSavingStatuses,
  updateLoadingStatuses,
} from './slice';

const initialState = reducer(undefined, { type: '@@INIT' });

describe('release-notes slice', () => {
  test('fetchReleaseNotesSuccess replaces list', () => {
    const state = reducer(initialState, fetchReleaseNotesSuccess([{ id: 1 }]));
    expect(state.releaseNotes).toEqual([{ id: 1 }]);
  });

  test('createReleaseNote prepends item', () => {
    const withOne = { ...initialState, releaseNotes: [{ id: 1 }] };
    const state = reducer(withOne, createReleaseNote({ id: 2 }));
    expect(state.releaseNotes.map(n => n.id)).toEqual([2, 1]);
  });

  test('editReleaseNote replaces matching id', () => {
    const base = { ...initialState, releaseNotes: [{ id: 1, t: 'a' }, { id: 2, t: 'b' }] };
    const state = reducer(base, editReleaseNote({ id: 2, t: 'c' }));
    expect(state.releaseNotes).toEqual([{ id: 1, t: 'a' }, { id: 2, t: 'c' }]);
  });

  test('deleteReleaseNote removes by id when payload not array', () => {
    const base = { ...initialState, releaseNotes: [{ id: 1 }, { id: 2 }] };
    const state = reducer(base, deleteReleaseNote(1));
    expect(state.releaseNotes).toEqual([{ id: 2 }]);
  });

  test('deleteReleaseNote replaces with reversed sorted array when payload array', () => {
    const base = { ...initialState, releaseNotes: [{ id: 9 }, { id: 1 }] };
    const state = reducer(base, deleteReleaseNote([{ id: 1 }, { id: 2 }, { id: 5 }]));
    expect(state.releaseNotes.map(n => n.id)).toEqual([5, 2, 1]);
  });

  test('updateSavingStatuses merges and sets errors', () => {
    const state = reducer(initialState, updateSavingStatuses({ status: { createReleaseNoteQuery: 'SUCCESSFUL' }, error: { creatingNote: false } }));
    expect(state.savingStatuses.createReleaseNoteQuery).toBe('SUCCESSFUL');
    expect(state.errors.creatingNote).toBe(false);
  });

  test('updateLoadingStatuses merges and sets errors', () => {
    const state = reducer(initialState, updateLoadingStatuses({ status: { fetchReleaseNotesQuery: 'FAILED' }, error: { loadingNotes: true } }));
    expect(state.loadingStatuses.fetchReleaseNotesQuery).toBe('FAILED');
    expect(state.errors.loadingNotes).toBe(true);
  });

  test('deleteReleaseNote with empty array results in empty list', () => {
    const base = { ...initialState, releaseNotes: [{ id: 1 }] };
    const state = reducer(base, deleteReleaseNote([]));
    expect(state.releaseNotes).toEqual([]);
  });

  test('sequential updates maintain expected order', () => {
    let state = reducer(initialState, fetchReleaseNotesSuccess([{ id: 1 }, { id: 2 }]));
    state = reducer(state, createReleaseNote({ id: 3 }));
    state = reducer(state, editReleaseNote({ id: 2, t: 'x' }));
    state = reducer(state, deleteReleaseNote(1));
    expect(state.releaseNotes.map(n => n.id)).toEqual([3, 2]);
  });
});
