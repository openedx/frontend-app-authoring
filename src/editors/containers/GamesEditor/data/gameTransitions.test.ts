import {
  addCard,
  clearError,
  emptyCard,
  initialState,
  loaded,
  removeCard,
  setCardOpen,
  setDirty,
  setError,
  setList,
  setLoadError,
  updateCardField,
  updateSetting,
  updateType,
} from './gameTransitions';

describe('game state transitions', () => {
  it('marks state dirty on a card edit', () => {
    const next = updateCardField(initialState, { index: 0 }, 'term', 'x');
    expect(next.list[0].term).toEqual('x');
    expect(next.isDirty).toBe(true);
  });

  it('ignores an edit to a card that does not exist', () => {
    expect(updateCardField(initialState, { index: 99 }, 'term', 'x')).toBe(initialState);
  });

  it('adds and removes cards', () => {
    const added = addCard(initialState, emptyCard());
    expect(added.list).toHaveLength(2);
    expect(added.isDirty).toBe(true);
    const removed = removeCard(added, 0);
    expect(removed.list).toHaveLength(1);
  });

  // The id is what an upload targets later, so the view and the upload must
  // agree on it: one id per card, generated once.
  it('gives each added card its own id', () => {
    const twice = addCard(addCard(initialState), undefined);
    const ids = twice.list.map((card) => card.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('ignores an out-of-range removal', () => {
    expect(removeCard(initialState, 5)).toBe(initialState);
    expect(removeCard(initialState, -1)).toBe(initialState);
  });

  it('gives every new card the image-path fields the block persists', () => {
    expect(emptyCard()).toHaveProperty('term_image_path', '');
    expect(emptyCard()).toHaveProperty('definition_image_path', '');
  });

  it('marks state dirty on a setting or type change', () => {
    expect(updateSetting(initialState, 'shuffle', false)).toMatchObject({
      settings: { shuffle: false },
      isDirty: true,
    });
    expect(updateType(initialState, 'matching')).toMatchObject({ type: 'matching', isDirty: true });
  });

  it('replaces the state and clears errors when settings load', () => {
    const dirty = setError(updateType(initialState, 'matching'), new Error('old'));
    expect(dirty.isDirty).toBe(true);
    // The fetched value carries whatever was there before; loading resets it.
    const next = loaded({ ...dirty, type: 'flashcards' });
    expect(next).toMatchObject({ type: 'flashcards', isDirty: false, isLoaded: true, error: null });
  });

  // editorOpen is UI state: it is not saved, so changing it is not a change
  // to the game. It must not arm the discard prompt or enable a no-op save.
  it('does not mark the game dirty when a card is expanded or collapsed', () => {
    const state = { ...initialState, list: [emptyCard()], isDirty: false };
    const collapsed = setCardOpen(state, 0, false);
    expect(collapsed.list[0].editorOpen).toBe(false);
    expect(collapsed.isDirty).toBe(false);
    const stillDirty = setCardOpen({ ...state, isDirty: true }, 0, true);
    expect(stillDirty.isDirty).toBe(true);
  });

  it('ignores expanding or collapsing a card that does not exist', () => {
    expect(setCardOpen(initialState, 5, true)).toBe(initialState);
  });

  it('records and clears errors', () => {
    const failed = setError(initialState, new Error('boom'));
    expect(failed.error?.message).toEqual('boom');
    expect(failed.loadFailed).toBe(false);
    const loadFailed = setLoadError(initialState, new Error('down'));
    expect(loadFailed.loadFailed).toBe(true);
    expect(clearError(loadFailed)).toMatchObject({ error: null, loadFailed: false });
  });

  it('marks state dirty on demand', () => {
    expect(setDirty(initialState).isDirty).toBe(true);
  });

  it('replaces the list and marks state dirty', () => {
    const next = setList(initialState, []);
    expect(next.list).toEqual([]);
    expect(next.isDirty).toBe(true);
  });
});

describe('async card updates target the card, not its position', () => {
  it('updates by card id even after the list has been reordered', () => {
    const a = { ...emptyCard(), term: 'a' };
    const b = { ...emptyCard(), term: 'b' };
    const state = { ...initialState, list: [a, b] };
    // Request was issued for card "a" at index 0; by the time it settles the
    // list has been reversed, so index 0 is now "b".
    const reordered = setList(state, [b, a]);
    const next = updateCardField(reordered, { cardId: a.id }, 'term_image', 'u');
    expect(next.list[1].term).toEqual('a');
    expect(next.list[1].term_image).toEqual('u');
    expect(next.list[0].term_image).toBeFalsy();
  });

  it('drops an update for a card that no longer exists', () => {
    expect(updateCardField(initialState, { cardId: 'gone' }, 'term_image', 'u')).toBe(initialState);
  });
});
