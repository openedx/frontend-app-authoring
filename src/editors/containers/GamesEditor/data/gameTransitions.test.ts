import {
  addCard,
  addDeck,
  clearError,
  decksFromSettings,
  deleteDeck,
  emptyCard,
  initialState,
  isBlankCard,
  loaded,
  moveDeck,
  moveCard,
  moveCardInDecks,
  removeCard,
  renameDeck,
  selectActiveCards,
  selectActiveDeck,
  selectDeck,
  setCardOpen,
  setDirty,
  setError,
  setList,
  setLoadError,
  stateFromSettings,
  updateCardField,
  updateSetting,
  updateType,
} from './gameTransitions';
import type { Card, Deck, GameState } from '@src/editors/containers/GamesEditor/types';

describe('game state transitions', () => {
  // A new block, or one with no saved cards, opens with an empty deck. The
  // blank draft an author types into comes from Add, not from the load.
  it('starts with an empty deck and no draft card', () => {
    expect(initialState.decks).toHaveLength(1);
    expect(initialState.decks[0].name).toEqual('Deck 1');
    expect(initialState.decks[0].cards).toEqual([]);
    expect(initialState.list).toEqual([]);
  });

  it('marks state dirty on a card edit', () => {
    const state = { ...addCard(initialState), isDirty: false };
    const next = updateCardField(state, { index: 0 }, 'term', 'x');
    expect(next.list[0].term).toEqual('x');
    expect(next.isDirty).toBe(true);
  });

  it('ignores an edit to a card that does not exist', () => {
    expect(updateCardField(initialState, { index: 99 }, 'term', 'x')).toBe(initialState);
  });

  it('adds and removes cards', () => {
    const added = addCard(initialState, emptyCard());
    expect(added.list).toHaveLength(1);
    expect(added.isDirty).toBe(true);
    const removed = removeCard(added, 0);
    expect(removed.list).toHaveLength(0);
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

  // Collapsed by default is for loaded content only: a card the author adds is
  // a form to fill in, so it starts open.
  it('starts a loaded card collapsed and an added one open', () => {
    const state = stateFromSettings({ cards: [{ term: 't', definition: 'd', card_key: 'k' }] });
    expect(state.decks[0].cards[0].editorOpen).toBe(false);
    expect(emptyCard().editorOpen).toBe(true);

    const added = addCard(state);
    expect(added.list[added.list.length - 1]).toMatchObject({ term: '', editorOpen: true });
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
    const state = { ...addCard(initialState), isDirty: false };
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

describe('decks', () => {
  const twoDecks = () =>
    decksFromSettings({
      decks: [
        { deck_key: 'dk-1', name: 'Basics', cards: [{ term: 'a', definition: 'b', card_key: 'c1' }] },
        { deck_key: 'dk-2', name: 'Advanced', cards: [] },
      ],
    });

  const stateWithTwoDecks = () => {
    const decks = twoDecks();
    return { ...initialState, decks, activeDeckId: decks[0].id, list: decks[0].cards };
  };

  // A backend that predates decks sends only `cards`; the editor must still
  // show one editable deck and save it back.
  it('loads one Deck 1 from a backend that sends no decks', () => {
    const state = stateFromSettings({ cards: [{ term: 't', definition: 'd', card_key: 'k' }] });

    expect(state.decks).toHaveLength(1);
    expect(state.decks[0]).toMatchObject({ name: 'Deck 1' });
    expect(state.decks[0].deck_key).toBeUndefined();
    expect(state.decks[0].cards[0]).toMatchObject({ term: 't', definition: 'd', card_key: 'k' });
    expect(state.decks[0].cards[0].editorOpen).toBe(false);
    expect(state.activeDeckId).toEqual(state.decks[0].id);
    expect(state.list).toEqual(state.decks[0].cards);
    expect(state.isLoaded).toBe(true);
    expect(state.isDirty).toBe(false);
  });

  it('loads the decks the block returned, in order, with their keys', () => {
    const state = stateFromSettings({
      game_type: 'flashcards',
      decks: [
        { deck_key: 'dk-1', name: 'Basics', cards: [{ term: 'a', definition: 'b', card_key: 'c1' }] },
        { deck_key: 'dk-2', name: 'Advanced', cards: [] },
      ],
    });

    expect(state.decks.map((deck) => deck.name)).toEqual(['Basics', 'Advanced']);
    expect(state.decks.map((deck) => deck.deck_key)).toEqual(['dk-1', 'dk-2']);
    expect(state.activeDeckId).toEqual(state.decks[0].id);
    // Two decks loaded from one response must not share a local id.
    expect(new Set(state.decks.map((deck) => deck.id)).size).toEqual(2);
    // A loaded empty deck stays empty: no placeholder card is invented.
    expect(state.decks[1].cards).toEqual([]);
    // Loaded cards start collapsed.
    expect(state.decks[0].cards[0].editorOpen).toBe(false);
  });

  // Switching decks is navigation, not a change to the game content.
  it('selects a deck without marking the state dirty', () => {
    const state = stateWithTwoDecks();
    const next = selectDeck(state, state.decks[1].id);

    expect(next.activeDeckId).toEqual(state.decks[1].id);
    expect(next.list).toEqual(state.decks[1].cards);
    expect(next.isDirty).toBe(false);
  });

  // Navigation never invents a card: an empty deck stays empty.
  it('keeps an empty deck empty when it is selected', () => {
    const state = stateWithTwoDecks();
    expect(state.decks[1].cards).toEqual([]);

    const next = selectDeck(state, state.decks[1].id);

    expect(selectActiveCards(next)).toEqual([]);
    expect(next.list).toEqual([]);
    expect(next.isDirty).toBe(false);
  });

  // Emptying a deck by removing its last card leaves no draft behind either;
  // the author asks for a card with the deck's Add control.
  it('leaves a deck emptied by removal empty until a card is added', () => {
    const state = stateWithTwoDecks();
    const next = removeCard(state, 0);

    expect(next.decks[0].cards).toEqual([]);
    expect(next.isDirty).toBe(true);

    // An explicit Add is the only thing that makes a draft card, and it is open.
    const added = addCard(next);
    expect(selectActiveCards(added)).toHaveLength(1);
    expect(selectActiveCards(added)[0]).toMatchObject({ term: '', editorOpen: true });
  });

  it('adds a deck with a free name and starts editing it', () => {
    const state = stateWithTwoDecks();
    const next = addDeck(state);

    expect(next.decks.map((deck) => deck.name)).toEqual(['Basics', 'Advanced', 'Deck 3']);
    expect(next.activeDeckId).toEqual(next.decks[2].id);
    // A new deck has no cards, and adding it writes no draft into it.
    expect(selectActiveCards(next)).toEqual([]);
    expect(next.isDirty).toBe(true);
  });

  it('renames a deck', () => {
    const state = stateWithTwoDecks();
    const next = renameDeck(state, state.decks[1].id, 'Harder');

    expect(next.decks.map((deck) => deck.name)).toEqual(['Basics', 'Harder']);
    expect(next.activeDeckId).toEqual(state.activeDeckId);
    expect(next.isDirty).toBe(true);
  });

  it('never deletes the last deck', () => {
    expect(deleteDeck(initialState, initialState.decks[0].id)).toBe(initialState);
  });

  it('deletes a non-active deck and stays on the active one', () => {
    const state = stateWithTwoDecks();
    const active = selectDeck(state, state.decks[1].id);

    const next = deleteDeck(active, active.decks[0].id);

    expect(next.decks.map((deck) => deck.name)).toEqual(['Advanced']);
    expect(next.activeDeckId).toEqual(active.decks[1].id);
    expect(next.list).toEqual(active.decks[1].cards);
    expect(next.isDirty).toBe(true);
  });

  it('deletes a deck and edits a neighbour when it was active', () => {
    const state = stateWithTwoDecks();
    const next = deleteDeck(state, state.decks[0].id);

    expect(next.decks.map((deck) => deck.name)).toEqual(['Advanced']);
    expect(next.activeDeckId).toEqual(next.decks[0].id);
    expect(next.list).toEqual(next.decks[0].cards);
    expect(next.isDirty).toBe(true);
  });

  // The card object moves, so its id (uploads), card_key (the block's
  // identity) and images go with it.
  it('moves a card to another deck keeping its id, key and images', () => {
    const state = stateWithTwoDecks();
    const [card] = state.decks[0].cards;

    const next = moveCard(state, card.id, { deckId: state.decks[1].id, index: 0 });

    expect(next.decks[0].cards).toEqual([]);
    expect(next.decks[1].cards).toEqual([card]);
    expect(next.decks[1].cards[0]).toMatchObject({ id: card.id, card_key: 'c1', term: 'a' });
    expect(next.isDirty).toBe(true);
  });

  it('ignores a drop on the position the card already has', () => {
    const state = stateWithTwoDecks();
    expect(moveCard(state, state.decks[0].cards[0].id, { deckId: state.decks[0].id, index: 0 })).toBe(state);
  });

  // The built-in editor edits and reorders the active deck's list; the other
  // decks must not move.
  it('edits, adds, removes and reorders only the active deck', () => {
    const state = stateWithTwoDecks();
    // Deck 2 starts empty; seed it with the explicit Add, then work in it.
    const seeded = addCard(state, { ...emptyCard(), term: 'x' }, state.decks[1].id);
    const active = selectDeck(seeded, seeded.decks[1].id);

    const edited = updateCardField(active, { index: 0 }, 'term', 'y');
    expect(selectActiveCards(edited)[0].term).toEqual('y');
    expect(edited.decks[0].cards[0].term).toEqual('a');
    // The rendered list is the active deck's cards, not a copy.
    expect(edited.list).toBe(selectActiveCards(edited));

    const added = addCard(active, { ...emptyCard(), term: 'new' });
    expect(selectActiveCards(added)).toHaveLength(2);
    expect(added.decks[0].cards).toHaveLength(1);

    const removed = removeCard(added, 0);
    expect(selectActiveCards(removed).map((card) => card.term)).toEqual(['new']);

    const reordered = setList(active, []);
    expect(selectActiveCards(reordered)).toEqual([]);
    expect(reordered.decks[0].cards).toHaveLength(1);
  });

  // An upload can settle after the author switched decks; the id still finds
  // the card, wherever it now is.
  it('updates a card by id even in a deck that is no longer active', () => {
    const state = stateWithTwoDecks();
    const cardId = state.decks[0].cards[0].id;
    const switched = selectDeck(state, state.decks[1].id);

    const next = updateCardField(switched, { cardId }, 'term_image', '/media/a.png');

    expect(next.decks[0].cards[0].term_image).toEqual('/media/a.png');
    expect(next.list).toEqual(switched.decks[1].cards);
  });

  it('exposes the deck being edited', () => {
    const state = stateWithTwoDecks();
    expect(selectActiveDeck(state)).toEqual(state.decks[0]);
    expect(selectActiveCards(state)).toEqual(state.decks[0].cards);
    expect(selectDeck(state, state.decks[1].id).decks[0].cards).toEqual(state.decks[0].cards);
  });
});

// Deck order is the order the block saves, and the deck object moves whole: a
// reorder changes nothing inside a deck.
describe('moving a deck to a position', () => {
  const threeDecks = () =>
    decksFromSettings({
      decks: [
        { deck_key: 'dk-1', name: 'A', cards: [{ term: 'a', definition: 'x', card_key: 'c1' }] },
        { deck_key: 'dk-2', name: 'B', cards: [{ term: 'b', definition: 'y', card_key: 'c2' }] },
        { deck_key: 'dk-3', name: 'C', cards: [] },
      ],
    });

  const stateWithThreeDecks = () => {
    const decks = threeDecks();
    return { ...initialState, decks, activeDeckId: decks[0].id, list: decks[0].cards };
  };

  const names = (state: GameState) => state.decks.map((deck) => deck.name);

  // The index is a position in the final list, not a slot in the list as it was.
  it('moves a deck to a later position', () => {
    const state = stateWithThreeDecks();
    const next = moveDeck(state, state.decks[0].id, 2);

    expect(names(next)).toEqual(['B', 'C', 'A']);
    expect(next.decks.map((deck) => deck.deck_key)).toEqual(['dk-2', 'dk-3', 'dk-1']);
    expect(next.isDirty).toBe(true);
  });

  it('moves a deck to an earlier position', () => {
    const state = stateWithThreeDecks();
    expect(names(moveDeck(state, state.decks[2].id, 0))).toEqual(['C', 'A', 'B']);
    expect(names(moveDeck(state, state.decks[2].id, 1))).toEqual(['A', 'C', 'B']);
  });

  it('moves a deck to a middle position', () => {
    const state = stateWithThreeDecks();
    expect(names(moveDeck(state, state.decks[0].id, 1))).toEqual(['B', 'A', 'C']);
  });

  // The deck object travels as it is: its key, its cards and the editor state
  // of each card (a card's open flag is UI, not saved) are untouched.
  it('moves the deck object itself, with its cards and their open state', () => {
    const state = stateWithThreeDecks();
    const moved = state.decks[0];
    const openCard = { ...moved.cards[0], editorOpen: true };
    const withOpenCard = {
      ...state,
      decks: [{ ...moved, cards: [openCard] }, ...state.decks.slice(1)],
    };

    const next = moveDeck(withOpenCard, moved.id, 2);

    expect(next.decks[2]).toBe(withOpenCard.decks[0]);
    expect(next.decks[2].cards[0]).toBe(openCard);
    expect(next.decks[2].cards[0]).toMatchObject({ card_key: 'c1', editorOpen: true, term: 'a' });
    expect(withOpenCard.decks[0].cards[0].editorOpen).toBe(true);
  });

  it('clamps a position past either end', () => {
    const state = stateWithThreeDecks();
    expect(names(moveDeck(state, state.decks[0].id, 99))).toEqual(['B', 'C', 'A']);
    // A negative index means the front, not "counted from the end" as splice
    // would read it.
    expect(names(moveDeck(state, state.decks[2].id, -1))).toEqual(['C', 'A', 'B']);
  });

  // A slot drawn as a fraction is truncated first: 1.9 is the second place,
  // and 1.5 from the deck that is already second is no move at all.
  it('truncates a fractional position before moving', () => {
    const state = stateWithThreeDecks();
    expect(names(moveDeck(state, state.decks[0].id, 1.9))).toEqual(['B', 'A', 'C']);
    expect(moveDeck(state, state.decks[1].id, 1.5)).toBe(state);
    expect(state.isDirty).toBe(false);
  });

  // Anything that is not a move must not be written: the identical state, so
  // the editor stays clean and a save is not offered.
  it('leaves the state alone for an unknown deck, a NaN index or the deck\'s own slot', () => {
    const state = stateWithThreeDecks();
    const [first, middle] = state.decks;

    expect(moveDeck(state, 'no-such-deck', 0)).toBe(state);
    expect(moveDeck(state, first.id, Number.NaN)).toBe(state);
    expect(moveDeck(state, middle.id, 1)).toBe(state);
    expect(moveDeck(initialState, initialState.decks[0].id, 0)).toBe(initialState);
    expect(state.isDirty).toBe(false);
  });

  // The deck order is not the selection: the deck being edited stays active,
  // and the compatibility view keeps showing its cards.
  it('keeps the active deck and refreshes the compatibility list', () => {
    const loaded = stateWithThreeDecks();
    const state = selectDeck(loaded, loaded.decks[1].id);
    const activeId = state.decks[1].id;
    const activeCards = state.decks[1].cards;

    const next = moveDeck(state, state.decks[0].id, 2);

    expect(next.activeDeckId).toEqual(activeId);
    expect(selectActiveDeck(next).id).toEqual(activeId);
    expect(next.list).toBe(activeCards);
    expect(next.list).toBe(next.decks[0].cards);
    expect(next.isDirty).toBe(true);
  });

  it('does not touch the state it was given', () => {
    const state = stateWithThreeDecks();
    const before = names(state);

    moveDeck(state, state.decks[0].id, 2);

    expect(names(state)).toEqual(before);
  });
});

describe('backend deck capability and hardening', () => {
  const twoDecks = () =>
    decksFromSettings({
      decks: [
        { deck_key: 'dk-1', name: 'Basics', cards: [{ term: 'a', definition: 'b', card_key: 'c1' }] },
        { deck_key: 'dk-2', name: 'Advanced', cards: [{ term: 'c', definition: 'd', card_key: 'c2' }] },
      ],
    });

  const stateWithTwoDecks = () => {
    const decks = twoDecks();
    return { ...initialState, decks, activeDeckId: decks[0].id, list: decks[0].cards };
  };

  // The block only declares the field once it sends decks; an older block must
  // never be sent one.
  it('knows whether the backend declared decks', () => {
    expect(stateFromSettings({ cards: [] }).supportsDecks).toBe(false);
    expect(stateFromSettings({}).supportsDecks).toBe(false);
    expect(stateFromSettings({ decks: [] }).supportsDecks).toBe(true);
    expect(stateFromSettings({ decks: [{ name: 'A', cards: [] }] }).supportsDecks).toBe(true);
    // Transitions carry the capability with the state.
    expect(addDeck(stateFromSettings({ decks: [{ name: 'A', cards: [] }] })).supportsDecks).toBe(true);
  });

  // Matching is the flat game: it renders the primary deck only, so editing a
  // hidden secondary deck has to stop when the type changes.
  it('keeps every deck but selects the primary one when switching to matching', () => {
    const state = stateWithTwoDecks();
    const onSecondary = selectDeck(state, state.decks[1].id);

    const next = updateType(onSecondary, 'matching');

    expect(next.type).toEqual('matching');
    expect(next.activeDeckId).toEqual(next.decks[0].id);
    expect(next.list).toEqual(next.decks[0].cards);
    expect(next.decks).toHaveLength(2);
    expect(next.isDirty).toBe(true);
  });

  // A blank card the block already keyed is authored content: moving another
  // card into its deck must not quietly delete it.
  it('keeps an authored blank card when a card moves into its deck', () => {
    const authoredBlank = { ...emptyCard(), card_key: 'kb' };
    const decks = twoDecks();
    const state = {
      ...initialState,
      decks: [{ ...decks[0] }, { ...decks[1], cards: [authoredBlank] }],
      activeDeckId: decks[0].id,
      list: decks[0].cards,
    };

    const next = moveCard(state, decks[0].cards[0].id, { deckId: decks[1].id, index: 1 });

    expect(next.decks[1].cards.map((card) => card.card_key)).toEqual(['kb', 'c1']);
  });

  it('does not move the active deck when switching back to flashcards', () => {
    const state = stateWithTwoDecks();
    const onSecondary = selectDeck(state, state.decks[1].id);

    expect(updateType(onSecondary, 'flashcards').activeDeckId).toEqual(state.decks[1].id);
  });

  // A caller with a bad deck list must not crash the editor.
  it('leaves the state alone when a transition would empty the deck list', () => {
    const state = { ...initialState, decks: [], list: [] };

    expect(() => setList(state, [emptyCard()])).not.toThrow();
    expect(setList(state, [emptyCard()]).decks).toEqual([]);
  });

  it('loads without crashing when decks or cards are not arrays', () => {
    const noDeckArray = stateFromSettings({ decks: {} } as never);
    expect(noDeckArray.decks).toHaveLength(1);
    expect(noDeckArray.decks[0].name).toEqual('Deck 1');

    const noCardArray = stateFromSettings({ cards: 'nope' } as never);
    expect(noCardArray.decks[0].cards).toEqual([]);

    const noCardsAtAll = stateFromSettings({});
    expect(noCardsAtAll.decks[0].cards).toEqual([]);

    const junkDeck = stateFromSettings({ decks: [null] } as never);
    expect(junkDeck.decks).toHaveLength(1);
    expect(junkDeck.decks[0].name).toEqual('Deck 1');
    expect(junkDeck.decks[0].cards).toEqual([]);
  });
});

describe('moving a card to a position', () => {
  // The card's id is its name here, so every assertion reads as the cards it
  // names, and the order it asserts is the order a save would write.
  const card = (id: string): Card => ({ ...emptyCard(), id, term: id, card_key: `key-${id}` });
  const deckOf = (id: string, ids: string[]): Deck => ({ id, name: id, cards: ids.map(card) });
  const stateOf = (...decks: Deck[]): GameState => ({
    ...initialState,
    decks,
    activeDeckId: decks[0].id,
    list: decks[0].cards,
  });
  const order = (state: GameState, deckId: string) =>
    state.decks.find((deck) => deck.id === deckId)?.cards.map((entry) => entry.id);

  // The worked examples from the plan. Asserting the final order, not the index
  // the caller passed, is what catches a missing downward adjustment.
  it('moves a card down inside its own deck', () => {
    const state = stateOf(deckOf('d1', ['A', 'B', 'C']));
    expect(order(moveCard(state, 'A', { deckId: 'd1', index: 1 }), 'd1')).toEqual(['B', 'A', 'C']);
    expect(order(moveCard(state, 'A', { deckId: 'd1', index: 2 }), 'd1')).toEqual(['B', 'C', 'A']);
    expect(order(moveCard(state, 'B', { deckId: 'd1', index: 2 }), 'd1')).toEqual(['A', 'C', 'B']);
  });

  it('moves a card up inside its own deck', () => {
    const state = stateOf(deckOf('d1', ['A', 'B', 'C']));
    expect(order(moveCard(state, 'C', { deckId: 'd1', index: 0 }), 'd1')).toEqual(['C', 'A', 'B']);
    expect(order(moveCard(state, 'C', { deckId: 'd1', index: 1 }), 'd1')).toEqual(['A', 'C', 'B']);
  });

  it('moves the first card last and the last card first', () => {
    const state = stateOf(deckOf('d1', ['A', 'B', 'C']));
    expect(order(moveCard(state, 'A', { deckId: 'd1', index: 2 }), 'd1')).toEqual(['B', 'C', 'A']);
    expect(order(moveCard(state, 'C', { deckId: 'd1', index: 0 }), 'd1')).toEqual(['C', 'A', 'B']);
  });

  it('inserts at every position of another deck', () => {
    const state = stateOf(deckOf('d1', ['A']), deckOf('d2', ['X', 'Y']));
    expect(order(moveCard(state, 'A', { deckId: 'd2', index: 0 }), 'd2')).toEqual(['A', 'X', 'Y']);
    expect(order(moveCard(state, 'A', { deckId: 'd2', index: 1 }), 'd2')).toEqual(['X', 'A', 'Y']);
    // index === targetLength appends, and so does anything past it.
    expect(order(moveCard(state, 'A', { deckId: 'd2', index: 2 }), 'd2')).toEqual(['X', 'Y', 'A']);
    expect(order(moveCard(state, 'A', { deckId: 'd2', index: 9 }), 'd2')).toEqual(['X', 'Y', 'A']);
    expect(order(moveCard(state, 'A', { deckId: 'd2', index: 2 }), 'd1')).toEqual([]);
  });

  // The drag preview announces the position the card lands in, so the index a
  // move reports has to be the final position even for a fractional slot.
  it('reports the position the card really lands in', () => {
    const state = stateOf(deckOf('d1', ['A']), deckOf('d2', ['X', 'Y']));

    const moved = moveCardInDecks(state.decks, 'A', { deckId: 'd2', index: 1.5 });

    expect(moved.decks[1].cards.map((entry) => entry.id)).toEqual(['X', 'A', 'Y']);
    expect(moved.index).toEqual(1);
  });

  it('returns the same state for a drop on the position the card already has', () => {
    const state = stateOf(deckOf('d1', ['A', 'B', 'C']));
    expect(moveCard(state, 'A', { deckId: 'd1', index: 0 })).toBe(state);
    expect(moveCard(state, 'C', { deckId: 'd1', index: 2 })).toBe(state);
    expect(state.isDirty).toBe(false);
  });

  it('returns the same state for an unknown card or deck', () => {
    const state = stateOf(deckOf('d1', ['A']), deckOf('d2', ['X']));
    expect(moveCard(state, 'nope', { deckId: 'd2', index: 0 })).toBe(state);
    expect(moveCard(state, 'A', { deckId: 'nope', index: 0 })).toBe(state);
    expect(state.isDirty).toBe(false);
  });

  // A keyless blank card is a blank draft, not content: moving it would invent
  // a card in the target deck.
  it('rejects moving a blank draft', () => {
    const d1 = { ...deckOf('d1', []), cards: [emptyCard()] };
    const state = stateOf(d1, deckOf('d2', ['X']));
    expect(moveCard(state, d1.cards[0].id, { deckId: 'd2', index: 1 })).toBe(state);
  });

  it('drops one blank draft when a real card enters the deck', () => {
    const twoDrafts = { ...deckOf('d2', []), cards: [emptyCard(), emptyCard()] };
    const state = stateOf(deckOf('d1', ['A']), twoDrafts);
    const next = moveCard(state, 'A', { deckId: 'd2', index: 0 });
    expect(next.decks[1].cards.map((entry) => entry.term)).toEqual(['A', '']);
    expect(next.decks[1].cards.filter((entry) => !entry.card_key)).toHaveLength(1);

    const oneDraft = stateOf(deckOf('d1', ['A']), { ...deckOf('d2', []), cards: [emptyCard()] });
    expect(moveCard(oneDraft, 'A', { deckId: 'd2', index: 0 }).decks[1].cards.map((entry) => entry.term)).toEqual([
      'A',
    ]);
  });

  // A blank draft belongs to its own deck, and the deck a card leaves keeps its
  // own: only the deck the card enters gives one up, to the card replacing it.
  it('keeps the source deck\'s own blank draft when a real card moves out', () => {
    const sourceDraft = emptyCard();
    const targetDraft = emptyCard();
    const state = stateOf(
      { ...deckOf('d1', []), cards: [sourceDraft, card('A')] },
      { ...deckOf('d2', []), cards: [targetDraft, card('X')] },
    );

    const next = moveCard(state, 'A', { deckId: 'd2', index: 2 });

    expect(next.decks[0].cards.map((entry) => entry.term)).toEqual(['']);
    expect(next.decks[0].cards).toHaveLength(1);
    expect(next.decks[0].cards[0]).toBe(sourceDraft);
    // The target's draft is the one that goes: the card replaces it.
    expect(next.decks[1].cards.filter(isBlankCard)).toHaveLength(0);
    expect(next.decks[1].cards.map((entry) => entry.term)).toEqual(['X', 'A']);
  });

  // Within one deck nothing enters, so the deck keeps its draft: a move asked
  // for past the draft still reads as its real cards and then that same draft.
  it('keeps the blank draft last for a same-deck move requested after it', () => {
    const draft = emptyCard();
    const state = stateOf({ ...deckOf('d1', ['A', 'B']), cards: [card('A'), card('B'), draft] });

    const next = moveCard(state, 'A', { deckId: 'd1', index: 2 });

    expect(order(next, 'd1')).toEqual(['B', 'A', draft.id]);
    expect(next.decks[0].cards[2]).toBe(draft);
    expect(isBlankCard(next.decks[0].cards[2])).toBe(true);
    expect(next.isDirty).toBe(true);
  });

  // B is the last real card, so a drop on the draft asks for the order the deck
  // already has: no move, and nothing to save.
  it('returns the same state for the last real card dropped on the trailing draft', () => {
    const state = stateOf({ ...deckOf('d1', ['A', 'B']), cards: [card('A'), card('B'), emptyCard()] });

    expect(moveCard(state, 'B', { deckId: 'd1', index: 2 })).toBe(state);
    expect(state.isDirty).toBe(false);
  });

  // The card object travels whole: id (uploads target it), card_key (the
  // block's identity), both images with their storage key and alt, and its open
  // state.
  it('keeps every field the moved card carries', () => {
    const moving = {
      ...emptyCard(),
      id: 'M',
      card_key: 'key-m',
      term: 'mitochondrion',
      definition: 'produces ATP',
      term_image: '/media/t.png',
      term_image_path: 't.png',
      term_image_alt: 'a picture of one',
      definition_image: '/media/d.png',
      definition_image_path: 'd.png',
      definition_image_alt: 'a diagram',
      editorOpen: false,
    };
    const state = stateOf({ ...deckOf('d1', []), cards: [moving] }, deckOf('d2', ['X']));
    const next = moveCard(state, 'M', { deckId: 'd2', index: 0 });
    // The same object, not a copy: uploads and ids keep pointing at it.
    expect(next.decks[1].cards[0]).toBe(moving);
    expect(next.decks[1].cards[0]).toEqual(moving);
    expect(next.decks[0].cards).toEqual([]);
    expect(next.decks.flatMap((deck) => deck.cards).filter((entry) => entry.id === 'M')).toHaveLength(1);
    // Deck order is never touched; only card lists change.
    expect(next.decks.map((deck) => deck.id)).toEqual(['d1', 'd2']);
  });

  it('marks a real move dirty and keeps activeDeckId and list in step', () => {
    const state = stateOf(deckOf('d1', ['A', 'B']), deckOf('d2', ['X']));
    const next = moveCard(state, 'A', { deckId: 'd2', index: 1 });
    expect(next.isDirty).toBe(true);
    expect(next.activeDeckId).toEqual('d1');
    expect(next.list).toBe(next.decks[0].cards);
  });

  // The deck a card enters still holds its blank draft, so the caller's index
  // counts that card: 1 is "before X", and the transition shifts the gap up when
  // it drops the draft.
  it('counts the blank draft a card entering a deck replaces', () => {
    const withDraft = () => stateOf(deckOf('d1', ['A']), { ...deckOf('d2', ['X']), cards: [emptyCard(), card('X')] });

    expect(order(moveCard(withDraft(), 'A', { deckId: 'd2', index: 0 }), 'd2')).toEqual(['A', 'X']);
    expect(order(moveCard(withDraft(), 'A', { deckId: 'd2', index: 1 }), 'd2')).toEqual(['A', 'X']);
    expect(order(moveCard(withDraft(), 'A', { deckId: 'd2', index: 2 }), 'd2')).toEqual(['X', 'A']);

    // A deck holding only a blank draft puts the card first from either index.
    const draftOnly = () => stateOf(deckOf('d1', ['A']), { ...deckOf('d2', []), cards: [emptyCard()] });
    expect(order(moveCard(draftOnly(), 'A', { deckId: 'd2', index: 0 }), 'd2')).toEqual(['A']);
    expect(order(moveCard(draftOnly(), 'A', { deckId: 'd2', index: 1 }), 'd2')).toEqual(['A']);
  });

  // A move can land in the deck being edited, which is the case where a stale
  // compatibility list would show the wrong cards.
  it('keeps the active deck current when the move lands in it', () => {
    const decks = [deckOf('d1', ['A']), deckOf('d2', ['X', 'Y'])];
    const state: GameState = { ...initialState, decks, activeDeckId: 'd2', list: decks[1].cards };

    const next = moveCard(state, 'A', { deckId: 'd2', index: 1 });

    expect(next.activeDeckId).toEqual('d2');
    expect(next.list).toBe(next.decks[1].cards);
    expect(next.decks[1].cards.map((entry) => entry.term)).toEqual(['X', 'A', 'Y']);
  });

  // An out-of-range index can clamp back onto the card itself; that is still no
  // move, so the state must not become dirty.
  it('returns the same state for an index that clamps onto the card itself', () => {
    const state = stateOf(deckOf('d1', ['A', 'B', 'C']));

    expect(moveCard(state, 'C', { deckId: 'd1', index: 9 })).toBe(state);
    expect(moveCard(state, 'A', { deckId: 'd1', index: -1 })).toBe(state);
    // The clamp is plain Math, so the infinities are just out-of-range indices.
    expect(order(moveCard(state, 'A', { deckId: 'd1', index: Infinity }), 'd1')).toEqual(['B', 'C', 'A']);
    expect(order(moveCard(state, 'C', { deckId: 'd1', index: -Infinity }), 'd1')).toEqual(['C', 'A', 'B']);
  });

  // NaN is not a position at all: clamping it would put the card first and
  // dirty a state for a move nobody asked for.
  it('returns the same state for an index that is not a number', () => {
    const state = stateOf(deckOf('d1', ['A', 'B']), deckOf('d2', ['X']));

    expect(moveCard(state, 'A', { deckId: 'd2', index: Number.NaN })).toBe(state);
    expect(moveCard(state, 'A', { deckId: 'd1', index: Number.NaN })).toBe(state);
    expect(state.isDirty).toBe(false);
  });

  it('leaves the state it was given untouched', () => {
    const state = stateOf(deckOf('d1', ['A']), deckOf('d2', ['X']));
    const sourceCards = state.decks[0].cards;
    const targetCards = state.decks[1].cards;

    moveCard(state, 'A', { deckId: 'd2', index: 0 });

    expect(state.decks[0].cards).toBe(sourceCards);
    expect(state.decks[0].cards.map((entry) => entry.term)).toEqual(['A']);
    expect(state.decks[1].cards).toBe(targetCards);
    expect(state.decks[1].cards.map((entry) => entry.term)).toEqual(['X']);
    expect(state.list).toBe(sourceCards);
  });
});

// The outline renders several deck bodies at once, so a card action must be
// able to name its deck and card without the deck first becoming active.
describe('card actions that name a deck that is not active', () => {
  const card = (id: string, term: string): Card => ({ ...emptyCard(), id, term, card_key: `key-${id}` });
  const stateWithTwoDecks = (): GameState => {
    const decks: Deck[] = [
      { id: 'd1', name: 'Basics', cards: [card('a', 'a')] },
      { id: 'd2', name: 'Advanced', cards: [card('x', 'x'), card('y', 'y')] },
    ];
    return { ...initialState, decks, activeDeckId: 'd1', list: decks[0].cards };
  };
  const terms = (state: GameState, deckId: string) =>
    state.decks.find((deck) => deck.id === deckId)?.cards.map((entry) => entry.term);

  it('edits a card in a non-active deck by id', () => {
    const next = updateCardField(stateWithTwoDecks(), { cardId: 'x' }, 'term', 'changed');

    expect(terms(next, 'd2')).toEqual(['changed', 'y']);
    expect(terms(next, 'd1')).toEqual(['a']);
    expect(next.activeDeckId).toEqual('d1');
    expect(next.list).toBe(next.decks[0].cards);
    expect(next.isDirty).toBe(true);
  });

  it('opens and collapses a card in a non-active deck by id', () => {
    const closed = setCardOpen(stateWithTwoDecks(), { cardId: 'y' }, false);

    expect(closed.decks[1].cards[1].editorOpen).toBe(false);
    expect(closed.list).toBe(closed.decks[0].cards);
    // UI state only, as for a card in the active deck.
    expect(closed.isDirty).toBe(false);
  });

  it('reorders a non-active deck with an explicit deck id', () => {
    const state = stateWithTwoDecks();
    const [x, y] = state.decks[1].cards;
    const next = setList(state, [y, x], 'd2');

    expect(terms(next, 'd2')).toEqual(['y', 'x']);
    expect(terms(next, 'd1')).toEqual(['a']);
    expect(next.activeDeckId).toEqual('d1');
    expect(next.list).toBe(next.decks[0].cards);
    expect(next.isDirty).toBe(true);
  });

  it('appends a card to a named deck', () => {
    const next = addCard(stateWithTwoDecks(), card('z', 'z'), 'd2');

    expect(terms(next, 'd2')).toEqual(['x', 'y', 'z']);
    expect(terms(next, 'd1')).toEqual(['a']);
    expect(next.list).toBe(next.decks[0].cards);
  });

  it('removes a card from a non-active deck by id', () => {
    const next = removeCard(stateWithTwoDecks(), { cardId: 'x' });

    expect(terms(next, 'd2')).toEqual(['y']);
    expect(terms(next, 'd1')).toEqual(['a']);
    expect(next.list).toBe(next.decks[0].cards);
  });

  // The older call shape still means the active deck.
  it('keeps the position call shape on the active deck', () => {
    const state = stateWithTwoDecks();
    const next = setList(state, [state.decks[0].cards[0], card('b', 'b')]);

    expect(terms(next, 'd1')).toEqual(['a', 'b']);
    expect(terms(next, 'd2')).toEqual(['x', 'y']);
    expect(next.list).toBe(next.decks[0].cards);
  });

  it('returns the same state for an unknown deck or card id', () => {
    const state = stateWithTwoDecks();

    expect(setList(state, [], 'missing')).toBe(state);
    expect(addCard(state, emptyCard(), 'missing')).toBe(state);
    expect(removeCard(state, { cardId: 'missing' })).toBe(state);
    expect(setCardOpen(state, { cardId: 'missing' }, true)).toBe(state);
    expect(updateCardField(state, { cardId: 'missing' }, 'term', 'x')).toBe(state);
    expect(state.isDirty).toBe(false);
  });
});
