import type { Card, Deck, GameState } from '@src/editors/containers/GamesEditor/types';
import { type CardDropOver, resolveCardDrop } from './cardDropTarget';
import { emptyCard, initialState, isBlankCard, moveCard } from './gameTransitions';

// A card's id is its name here, so every assertion reads as the card it names.
const card = (id: string): Card => ({ ...emptyCard(), id, term: id, card_key: `key-${id}` });
const deckWith = (id: string, ...cards: Card[]): Deck => ({ id, name: id, cards });
const deckOf = (id: string, ids: string[]): Deck => deckWith(id, ...ids.map(card));
const decks = () => [deckOf('cell', ['A', 'B', 'C']), deckOf('genetics', ['X', 'Y'])];

describe('resolveCardDrop', () => {
  it('drops before the hovered row when moving up', () => {
    expect(resolveCardDrop(decks(), 'C', { kind: 'card', deckId: 'cell', cardId: 'A' }))
      .toEqual({ deckId: 'cell', index: 0 });
    expect(resolveCardDrop(decks(), 'C', { kind: 'card', deckId: 'cell', cardId: 'B' }))
      .toEqual({ deckId: 'cell', index: 1 });
  });

  // The gap dnd-kit draws on a downward move is below the row being passed, and
  // a card moving down has already vacated its own position, so the -1 applies
  // once: A over B lands at 1 and A over C at 2.
  it('drops after the hovered row when moving down', () => {
    expect(resolveCardDrop(decks(), 'A', { kind: 'card', deckId: 'cell', cardId: 'B' }))
      .toEqual({ deckId: 'cell', index: 1 });
    expect(resolveCardDrop(decks(), 'A', { kind: 'card', deckId: 'cell', cardId: 'C' }))
      .toEqual({ deckId: 'cell', index: 2 });
  });

  // Rows of another deck never draw a gap: dnd-kit drops its transforms once
  // the active item is in a different container, so a hovered row means "insert
  // before it" whatever deck comes first. That is what makes index 0 of a later
  // deck reachable; the deck header is what appends.
  it('inserts before the hovered row of a later deck, index 0 included', () => {
    expect(resolveCardDrop(decks(), 'A', { kind: 'card', deckId: 'genetics', cardId: 'X' }))
      .toEqual({ deckId: 'genetics', index: 0 });
    expect(resolveCardDrop(decks(), 'A', { kind: 'card', deckId: 'genetics', cardId: 'Y' }))
      .toEqual({ deckId: 'genetics', index: 1 });
  });

  it('inserts before the hovered row of an earlier deck', () => {
    expect(resolveCardDrop(decks(), 'X', { kind: 'card', deckId: 'cell', cardId: 'A' }))
      .toEqual({ deckId: 'cell', index: 0 });
    expect(resolveCardDrop(decks(), 'X', { kind: 'card', deckId: 'cell', cardId: 'B' }))
      .toEqual({ deckId: 'cell', index: 1 });
  });

  // Deck order must not decide before/after: the same row seen from a deck on
  // either side of it resolves to the same index.
  it('resolves the same row the same way from a deck on either side', () => {
    const fromLater = [deckOf('genetics', ['X', 'Y']), deckOf('cell', ['A', 'B', 'C'])];
    expect(resolveCardDrop(decks(), 'A', { kind: 'card', deckId: 'genetics', cardId: 'Y' }))
      .toEqual({ deckId: 'genetics', index: 1 });
    expect(resolveCardDrop(fromLater, 'A', { kind: 'card', deckId: 'genetics', cardId: 'Y' }))
      .toEqual({ deckId: 'genetics', index: 1 });
  });

  // A deck holding only a blank draft has one row and nothing saved, so its
  // drop zone is the deck header, and its only position is 0.
  it('drops into a deck holding only a blank draft at index 0', () => {
    const withEmpty = [...decks(), deckWith('ecology', emptyCard())];
    expect(resolveCardDrop(withEmpty, 'A', { kind: 'deck', deckId: 'ecology' }))
      .toEqual({ deckId: 'ecology', index: 0 });
  });

  // Hovering a collapsed header must mean something before any of that deck's
  // rows exist, so it appends.
  it('appends when hovering a deck header', () => {
    expect(resolveCardDrop(decks(), 'A', { kind: 'deck', deckId: 'genetics' }))
      .toEqual({ deckId: 'genetics', index: 2 });
  });

  it('means nothing over the position the card already has', () => {
    expect(resolveCardDrop(decks(), 'A', { kind: 'card', deckId: 'cell', cardId: 'A' })).toBeNull();
    // Already the last card of its own deck, so its own header appends nowhere.
    expect(resolveCardDrop(decks(), 'C', { kind: 'deck', deckId: 'cell' })).toBeNull();
  });

  // A blank draft has no content to move, so a drag never starts from one;
  // moveCard refuses it too, and this is the same rule.
  it('means nothing for a card that is only a blank draft', () => {
    const draft = emptyCard();
    const state = [deckWith('cell', draft), deckOf('genetics', ['X'])];
    expect(resolveCardDrop(state, draft.id, { kind: 'card', deckId: 'genetics', cardId: 'X' })).toBeNull();
    expect(resolveCardDrop(state, draft.id, { kind: 'deck', deckId: 'genetics' })).toBeNull();
  });

  it('means nothing without a target, or for an unknown card or deck', () => {
    expect(resolveCardDrop(decks(), 'A', null)).toBeNull();
    expect(resolveCardDrop(decks(), 'A', undefined)).toBeNull();
    expect(resolveCardDrop(decks(), 'nope', { kind: 'card', deckId: 'cell', cardId: 'B' })).toBeNull();
    expect(resolveCardDrop(decks(), 'A', { kind: 'deck', deckId: 'nope' })).toBeNull();
    expect(resolveCardDrop(decks(), 'A', { kind: 'card', deckId: 'cell', cardId: 'nope' })).toBeNull();
  });
});

// The resolver reports the index moveCard takes, so the two are composed here:
// an index that means one thing to the resolver and another to the transition
// would pass both of their own suites and fail only here.
describe('resolveCardDrop feeding moveCard', () => {
  const stateOf = (...deckList: Deck[]): GameState => ({
    ...initialState,
    decks: deckList,
    activeDeckId: deckList[0].id,
    list: deckList[0].cards,
  });
  const terms = (state: GameState, deckId: string) =>
    state.decks.find((deck) => deck.id === deckId)?.cards.map((entry) => entry.term);
  const drop = (state: GameState, cardId: string, over: CardDropOver): GameState => {
    const target = resolveCardDrop(state.decks, cardId, over);
    if (!target) { throw new Error(`no drop target for ${cardId}`); }
    return moveCard(state, cardId, target);
  };

  // The deck entered holds [blank draft, X]. Hovering X from a later deck means
  // "before X", which is the draft's own position: the transition has to drop
  // the draft and leave the card where the author aimed.
  it('lands before the hovered row of a deck that starts with a blank draft', () => {
    const state = stateOf(deckWith('cell', emptyCard(), card('X')), deckOf('genetics', ['A']));
    const next = drop(state, 'A', { kind: 'card', deckId: 'cell', cardId: 'X' });

    expect(terms(next, 'cell')).toEqual(['A', 'X']);
    expect(next.decks[0].cards.filter(isBlankCard)).toHaveLength(0);
  });

  // The deck header is how a position after the last row is reached; the
  // entering card replaces the draft, so it lands before the drawn end.
  it('appends to a deck that starts with a blank draft through its header', () => {
    const state = stateOf(deckOf('cell', ['A']), deckWith('genetics', emptyCard(), card('X')));
    expect(terms(drop(state, 'A', { kind: 'deck', deckId: 'genetics' }), 'genetics'))
      .toEqual(['X', 'A']);
  });

  // The bug this fixes: from an earlier deck, the first row of a later one used
  // to mean "after it", so index 0 of a non-empty later deck was unreachable.
  it('moves a card to index 0 of a later deck that holds cards', () => {
    const state = stateOf(deckOf('cell', ['A']), deckOf('genetics', ['X', 'Y']));
    const next = drop(state, 'A', { kind: 'card', deckId: 'genetics', cardId: 'X' });

    expect(terms(next, 'genetics')).toEqual(['A', 'X', 'Y']);
    expect(terms(next, 'cell')).toEqual([]);
  });

  // Rows give 0..length-1 and the header gives length, so every insertion
  // position of another deck is reachable.
  it('reaches every position of another deck through its rows and its header', () => {
    const state = () => stateOf(deckOf('cell', ['A']), deckOf('genetics', ['X', 'Y', 'Z']));
    const landed = (target: CardDropOver) => (terms(drop(state(), 'A', target), 'genetics') ?? []).indexOf('A');

    expect(['X', 'Y', 'Z'].map((id) => landed({ kind: 'card', deckId: 'genetics', cardId: id })))
      .toEqual([0, 1, 2]);
    expect(landed({ kind: 'deck', deckId: 'genetics' })).toEqual(3);
  });

  it('fills an empty deck', () => {
    const state = stateOf(deckOf('cell', ['A']), deckWith('ecology', emptyCard()));
    const over = { kind: 'deck', deckId: 'ecology' } as const;

    expect(resolveCardDrop(state.decks, 'A', over)).toEqual({ deckId: 'ecology', index: 0 });
    const next = drop(state, 'A', over);
    expect(terms(next, 'ecology')).toEqual(['A']);
    expect(terms(next, 'cell')).toEqual([]);
  });

  // The downward adjustment has to survive the composition too, not only the
  // resolver's own arithmetic.
  it('reorders inside one deck', () => {
    const state = stateOf(deckOf('cell', ['A', 'B', 'C']));
    expect(terms(drop(state, 'A', { kind: 'card', deckId: 'cell', cardId: 'B' }), 'cell'))
      .toEqual(['B', 'A', 'C']);
    expect(terms(drop(state, 'C', { kind: 'card', deckId: 'cell', cardId: 'A' }), 'cell'))
      .toEqual(['C', 'A', 'B']);
  });

  // A trailing draft is a row the author may drop on, and its own deck's header
  // appends past it: both put the card after the real cards, and neither may
  // take the draft with it, because the deck is still being edited.
  it('keeps its own trailing draft last when a card is dropped on it or on the header', () => {
    const draft = emptyCard();
    const state = stateOf(deckWith('cell', card('A'), card('B'), draft));
    const targets: CardDropOver[] = [
      { kind: 'card', deckId: 'cell', cardId: draft.id },
      { kind: 'deck', deckId: 'cell' },
    ];

    for (const over of targets) {
      const next = drop(state, 'A', over);
      expect(terms(next, 'cell')).toEqual(['B', 'A', '']);
      expect(next.decks[0].cards[2]).toBe(draft);
      expect(isBlankCard(next.decks[0].cards[2])).toBe(true);
      expect(next.isDirty).toBe(true);
    }
  });
});
