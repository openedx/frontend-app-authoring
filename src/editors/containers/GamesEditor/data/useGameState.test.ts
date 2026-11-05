import { QueryClient } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { initializeMocks, makeQueryClientWrapper } from '@src/testUtils';

import * as api from './api';
import { emptyCard, useGameState } from './useGameState';

// Only the transport is mocked: buildSavePayload stays real, so the tests see
// the payload the block would actually receive.
jest.mock('./api', () => ({
  ...jest.requireActual('./api'),
  getSettings: jest.fn(),
  saveSettings: jest.fn(),
  uploadImage: jest.fn(),
}));

const mockedApi = api as unknown as Record<'getSettings' | 'saveSettings', jest.Mock>;
const block = {
  blockId: 'block-v1:org+course+run+type@games+block@abc',
  studioEndpointUrl: 'http://studio',
  isLibrary: false,
};

describe('emptyCard', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Card ids key image uploads and validation errors to a card, so two cards
  // must never share one, however close together they are created.
  it('gives two cards created in the same instant different ids', () => {
    jest.spyOn(Date, 'now').mockReturnValue(1700000000000);
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    expect(emptyCard().id).not.toEqual(emptyCard().id);
  });
});

// `useGameState` uses React Query, so rendering it bare needs a client. A new
// one per call, like a fresh page load, with no retries (as testUtils does).
// A null block means no fetch, so the hook starts from its initial state.
const renderGameState = () =>
  renderHook(() => useGameState(null), {
    wrapper: makeQueryClientWrapper(new QueryClient({ defaultOptions: { queries: { retry: false } } })),
  });

describe('useGameState', () => {
  beforeEach(() => {
    initializeMocks();
  });

  // The save path reads the state straight after awaiting an upload, before
  // React has re-rendered. There is one copy of the state and it is current.
  it('exposes the latest state synchronously after an action', () => {
    const { result } = renderGameState();
    const { actions } = result.current;
    const before = actions.getLatestState().list.length;
    act(() => {
      actions.addCard();
      // Still inside act: React has not re-rendered yet.
      expect(actions.getLatestState().list).toHaveLength(before + 1);
    });
  });

  // One store, not a rendered copy plus a synchronous mirror: after a change
  // the rendered state and the synchronous read are the same object.
  it('renders the same state object it exposes synchronously', () => {
    const { result } = renderGameState();
    act(() => {
      result.current.actions.addCard();
    });
    expect(result.current.state).toBe(result.current.actions.getLatestState());
  });
});

describe('saving with decks', () => {
  const wrapper = makeQueryClientWrapper(new QueryClient({ defaultOptions: { queries: { retry: false } } }));

  const loadBlock = (payload: Record<string, unknown>) => {
    mockedApi.getSettings.mockResolvedValue({ data: payload });
    return renderHook(() => useGameState(block), { wrapper });
  };

  const saveArgs = () => mockedApi.saveSettings.mock.calls[0][1];

  beforeEach(() => {
    initializeMocks();
    mockedApi.saveSettings.mockReset();
    mockedApi.saveSettings.mockResolvedValue({ data: { success: true } });
  });

  // The save runs after awaits, from the store: it projects the payload from
  // the state, so nothing a caller could hold can overwrite what it shows.
  it('saves the state, not what the caller could pass in', async () => {
    const { result } = loadBlock({
      game_type: 'flashcards',
      cards: [{ term: 'fresh', definition: 'd', card_key: 'k1' }],
      decks: [
        { deck_key: 'd1', name: 'Deck 1', cards: [{ term: 'fresh', definition: 'd', card_key: 'k1' }] },
        { deck_key: 'd2', name: 'Deck 2', cards: [] },
      ],
    });
    await waitFor(() => expect(result.current.state.isLoaded).toBe(true));

    await act(async () => {
      await result.current.actions.save({ title: 'Title' });
    });

    const payload = api.buildSavePayload(saveArgs());
    expect(payload.game_type).toEqual('flashcards');
    expect(payload.is_shuffled).toEqual(true);
    expect(payload.has_timer).toEqual(true);
    expect(payload.cards.map((card) => card.term)).toEqual(['fresh']);
    expect(payload.decks?.map((deck) => deck.name)).toEqual(['Deck 1', 'Deck 2']);
  });

  // A block that never sent decks does not declare the field; sending one would
  // be rejected outright.
  it('sends a cards-only save to a backend without decks', async () => {
    const { result } = loadBlock({
      game_type: 'flashcards',
      cards: [{ term: 'fresh', definition: 'd', card_key: 'k1' }],
    });
    await waitFor(() => expect(result.current.state.isLoaded).toBe(true));

    await act(async () => {
      await result.current.actions.save({ title: null });
    });

    expect(saveArgs()).not.toHaveProperty('decks');
    const payload = api.buildSavePayload(saveArgs());
    expect(payload).not.toHaveProperty('decks');
    expect(payload.cards.map((card) => card.term)).toEqual(['fresh']);
    expect(payload).not.toHaveProperty('display_name');
  });

  // A drag reports a position, so the action moves the card there without
  // touching the active deck, its compatibility list, or the card itself.
  it('moves a card to an explicit position in another deck', async () => {
    const { result } = loadBlock({
      game_type: 'flashcards',
      decks: [
        { deck_key: 'd1', name: 'Deck 1', cards: [{ term: 'a', definition: 'b', card_key: 'k1' }] },
        {
          deck_key: 'd2',
          name: 'Deck 2',
          cards: [{ term: 'x', definition: 'y', card_key: 'k2' }, { term: 'z', definition: 'w', card_key: 'k3' }],
        },
      ],
    });
    await waitFor(() => expect(result.current.state.isLoaded).toBe(true));
    const [first, second] = result.current.state.decks;
    const cardId = first.cards[0].id;

    act(() => result.current.actions.moveCard({ cardId, toDeckId: second.id, toIndex: 1 }));

    const { state } = result.current;
    expect(state.decks[0].cards).toEqual([]);
    expect(state.decks[1].cards.map((entry) => entry.term)).toEqual(['x', 'a', 'z']);
    // The card object travels whole, key included.
    expect(state.decks[1].cards[1]).toMatchObject({ id: cardId, card_key: 'k1' });
    expect(state.isDirty).toBe(true);
    // The active deck and its compatibility list are untouched.
    expect(state.activeDeckId).toEqual(first.id);
    expect(state.list).toBe(state.decks[0].cards);
  });

  // Dropping a card on the position it already has is no move: same state,
  // nothing dirty.
  it('leaves the state alone for a move to the same position', async () => {
    const { result } = loadBlock({
      game_type: 'flashcards',
      decks: [
        { deck_key: 'd1', name: 'Deck 1', cards: [{ term: 'a', definition: 'b', card_key: 'k1' }] },
        { deck_key: 'd2', name: 'Deck 2', cards: [] },
      ],
    });
    await waitFor(() => expect(result.current.state.isLoaded).toBe(true));
    const deck = result.current.state.decks[0];
    const before = result.current.state;

    act(() => result.current.actions.moveCard({ cardId: deck.cards[0].id, toDeckId: deck.id, toIndex: 0 }));

    expect(result.current.state).toBe(before);
    expect(result.current.state.isDirty).toBe(false);
  });

  // A deck drag reports the slot it landed in. The deck objects move whole, the
  // active deck stays selected, and the block receives the new order; the first
  // deck is the primary one, so the legacy `cards` mirror follows it.
  it('reorders decks and saves them in the new order, mirroring the new primary deck', async () => {
    const { result } = loadBlock({
      game_type: 'flashcards',
      decks: [
        { deck_key: 'd1', name: 'Deck 1', cards: [{ term: 'a', definition: 'b', card_key: 'k1' }] },
        { deck_key: 'd2', name: 'Deck 2', cards: [{ term: 'x', definition: 'y', card_key: 'k2' }] },
      ],
    });
    await waitFor(() => expect(result.current.state.isLoaded).toBe(true));
    const [first, second] = result.current.state.decks;
    const activeCards = first.cards;

    act(() => result.current.actions.moveDeck({ deckId: second.id, toIndex: 0 }));

    const { state } = result.current;
    expect(state.decks.map((deck) => deck.deck_key)).toEqual(['d2', 'd1']);
    // The deck object itself moved: its cards and key are the same ones.
    expect(state.decks[0]).toBe(second);
    expect(state.decks[1]).toBe(first);
    expect(state.isDirty).toBe(true);
    // Reordering is not selecting: Deck 1 is still the deck being edited.
    expect(state.activeDeckId).toEqual(first.id);
    expect(state.list).toBe(activeCards);

    await act(async () => {
      await result.current.actions.save({ title: null });
    });

    const payload = api.buildSavePayload(saveArgs());
    expect(payload.decks?.map((deck) => deck.deck_key)).toEqual(['d2', 'd1']);
    // The block keeps `cards` as the primary deck, which is now Deck 2.
    expect(payload.cards.map((card) => card.term)).toEqual(['x']);
    expect(payload.cards).toEqual(payload.decks?.[0].cards);
  });

  it('leaves the state alone for a deck move to the slot it already has', async () => {
    const { result } = loadBlock({
      game_type: 'flashcards',
      decks: [
        { deck_key: 'd1', name: 'Deck 1', cards: [] },
        { deck_key: 'd2', name: 'Deck 2', cards: [] },
      ],
    });
    await waitFor(() => expect(result.current.state.isLoaded).toBe(true));
    const before = result.current.state;
    const { id } = before.decks[1];

    act(() => result.current.actions.moveDeck({ deckId: id, toIndex: 1 }));

    expect(result.current.state).toBe(before);
    expect(result.current.state.isDirty).toBe(false);
  });
});

// Several deck bodies render at once, so the hook's card actions must accept a
// card or deck id and leave the active compatibility list where it was.
describe('card actions on a deck that is not active', () => {
  const wrapper = makeQueryClientWrapper(new QueryClient({ defaultOptions: { queries: { retry: false } } }));

  const loadBlock = () => {
    mockedApi.getSettings.mockResolvedValue({
      data: {
        game_type: 'flashcards',
        decks: [
          { deck_key: 'd1', name: 'Deck 1', cards: [{ term: 'a', definition: 'b', card_key: 'k1' }] },
          {
            deck_key: 'd2',
            name: 'Deck 2',
            cards: [{ term: 'x', definition: 'y', card_key: 'k2' }, { term: 'y', definition: 'x', card_key: 'k3' }],
          },
        ],
      },
    });
    return renderHook(() => useGameState(block), { wrapper });
  };

  beforeEach(() => {
    initializeMocks();
    mockedApi.getSettings.mockReset();
  });

  it('edits and collapses a card in a non-active deck by id', async () => {
    const { result } = loadBlock();
    await waitFor(() => expect(result.current.state.isLoaded).toBe(true));
    const activeCards = result.current.state.decks[0].cards;
    const cardId = result.current.state.decks[1].cards[0].id;

    act(() => result.current.actions.updateTerm({ cardId, term: 'changed' }));
    act(() => result.current.actions.toggleOpen({ cardId, isOpen: false }));

    const { state } = result.current;
    expect(state.decks[1].cards[0]).toMatchObject({ term: 'changed', editorOpen: false });
    expect(state.decks[1].cards[1].term).toEqual('y');
    expect(state.decks[0].cards.map((card) => card.term)).toEqual(['a']);
    expect(state.activeDeckId).toEqual(state.decks[0].id);
    expect(state.list).toBe(activeCards);
    expect(state.list).toBe(state.decks[0].cards);
  });

  it('reorders, appends and removes in a named deck only', async () => {
    const { result } = loadBlock();
    await waitFor(() => expect(result.current.state.isLoaded).toBe(true));
    const [first, second] = result.current.state.decks;
    const activeCards = first.cards;
    const [x, y] = second.cards;

    act(() => result.current.actions.setList({ deckId: second.id, cards: [y, x] }));
    expect(result.current.state.decks[1].cards.map((card) => card.term)).toEqual(['y', 'x']);

    act(() => result.current.actions.addCard(second.id));
    expect(result.current.state.decks[1].cards).toHaveLength(3);

    act(() => result.current.actions.removeCard({ cardId: x.id }));
    expect(result.current.state.decks[1].cards.map((card) => card.term)).toEqual(['y', '']);

    expect(result.current.state.decks[0].cards.map((card) => card.term)).toEqual(['a']);
    expect(result.current.state.activeDeckId).toEqual(first.id);
    expect(result.current.state.list).toBe(activeCards);
    expect(result.current.state.isDirty).toBe(true);
  });
});
