import { v4 as uuidv4 } from 'uuid';

import type {
  Card,
  CardDropTarget,
  Deck,
  GameSettings,
  GameState,
  GameType,
  SettingsDeck,
  SettingsResponse,
} from '@src/editors/containers/GamesEditor/types';

/**
 * Pure transitions on the editor's state. Each returns a new state, or the
 * same object when there is nothing to change. `useGameState` applies them
 * through its store; they are kept apart so they can be tested on their own.
 */

/** The name given to a block's only deck when it loads no decks of its own. */
export const DEFAULT_DECK_NAME = 'Deck 1';

export const emptyCard = (): Card => ({
  id: uuidv4(),
  term: '',
  term_image: '',
  term_image_path: '',
  term_image_alt: '',
  definition: '',
  definition_image: '',
  definition_image_path: '',
  definition_image_alt: '',
  editorOpen: true,
});

/** A new deck, with no cards: its header is the drop target until one is added. */
export const newDeck = (name: string): Deck => ({ id: uuidv4(), name, cards: [] });

const initialDeck = newDeck(DEFAULT_DECK_NAME);

export const initialState: GameState = {
  settings: { shuffle: true, timer: true },
  type: 'flashcards',
  decks: [initialDeck],
  activeDeckId: initialDeck.id,
  // Until `get_settings` says otherwise, assume a block that does not know decks.
  supportsDecks: false,
  // Compatibility view of the active deck's cards; every deck transition
  // refreshes it from `decks`.
  list: initialDeck.cards,
  isDirty: false,
  isLoaded: false,
  // Any failed request (load, save, image upload). Rendered by the editor.
  error: null,
  // True when the settings fetch itself failed, so the editor can offer a
  // retry instead of a spinner that never ends.
  loadFailed: false,
};

export type CardField = Exclude<keyof Card, 'id'>;

/**
 * Which card an edit targets. A synchronous edit may name a position in the
 * active deck, or a card's id when its position is unknown to the caller: an
 * image upload that settles late, or a deck body that is not the active one.
 */
export type CardTarget = { index: number; cardId?: undefined; } | { cardId: string; index?: undefined; };

/**
 * Where a card is: the deck holding it, that deck's position in the deck list
 * and the card's position in the deck. Null when no deck holds it. The one walk
 * the menu targets, the drop resolver and the drag preview all share.
 */
export const findCardLocation = (
  decks: Deck[],
  cardId: string,
): { deckIndex: number; deck: Deck; index: number; } | null => {
  for (const [deckIndex, deck] of decks.entries()) {
    const index = deck.cards.findIndex((card) => card.id === cardId);
    if (index >= 0) { return { deckIndex, deck, index }; }
  }
  return null;
};

/** Position of the active deck, or 0 if the id no longer names one. */
export const activeDeckIndex = (state: GameState): number => {
  const index = state.decks.findIndex((deck) => deck.id === state.activeDeckId);
  return index < 0 ? 0 : index;
};

/** Stand-in for a state with no decks, which no transition can produce. */
const NO_DECK: Deck = { id: '', name: DEFAULT_DECK_NAME, cards: [] };

/** The deck being edited; an empty deck list has nothing to edit. */
export const selectActiveDeck = (state: GameState): Deck => state.decks[activeDeckIndex(state)] || NO_DECK;

/** The active deck's cards; what the built-in editor renders. */
export const selectActiveCards = (state: GameState): Card[] => selectActiveDeck(state).cards;

/**
 * State with `decks` replaced, activating `activeDeckId` when it still names a
 * deck and refreshing the `list` compatibility view.
 */
const withDecks = (state: GameState, decks: Deck[], activeDeckId: string = state.activeDeckId): GameState => {
  // A block always has at least one deck; an empty list is a bad caller, not a
  // state to move to, so it leaves the current decks alone.
  if (!decks.length) { return state; }
  const active = decks.find((deck) => deck.id === activeDeckId) || decks[0];
  return { ...state, decks, activeDeckId: active.id, list: active.cards };
};

/** Where a target points: a deck's position and a card's position in it. */
const locate = (state: GameState, target: CardTarget): { deck: number; card: number; } | null => {
  const { cardId, index } = target;
  if (cardId != null) {
    const at = findCardLocation(state.decks, cardId);
    return at ? { deck: at.deckIndex, card: at.index } : null;
  }
  const deck = activeDeckIndex(state);
  if (!state.decks[deck] || !state.decks[deck].cards[index]) { return null; }
  return { deck, card: index };
};

/** Applies `update` to one located card, leaving every other card alone. */
const mapCard = (state: GameState, at: { deck: number; card: number; }, update: (card: Card) => Card): GameState => (
  withDecks(
    state,
    state.decks.map((deck, deckIndex) => (
      deckIndex === at.deck
        ? { ...deck, cards: deck.cards.map((card, cardIndex) => (cardIndex === at.card ? update(card) : card)) }
        : deck
    )),
  )
);

export const updateSetting = (state: GameState, key: keyof GameSettings, value: boolean): GameState => ({
  ...state,
  settings: { ...state.settings, [key]: value },
  isDirty: true,
});

export const updateType = (state: GameState, value: GameType): GameState => {
  // Matching is the flat game and renders only the primary deck, so the editor
  // must not stay on a deck Matching will not show. Every deck is kept.
  if (value === 'matching') {
    const primaryDeckId = state.decks[0]?.id ?? state.activeDeckId;
    return { ...withDecks(state, state.decks, primaryDeckId), type: value, isDirty: true };
  }
  return { ...state, type: value, isDirty: true };
};

export const updateCardField = (
  state: GameState,
  target: CardTarget,
  field: CardField,
  value: string | boolean,
): GameState => {
  const at = locate(state, target);
  if (!at) { return state; }
  return { ...mapCard(state, at, (card) => ({ ...card, [field]: value })), isDirty: true };
};

/** A numeric target is a position in the active deck; the older call shape. */
const asTarget = (target: number | CardTarget): CardTarget => (
  typeof target === 'number' ? { index: target } : target
);

// UI only: whether a card is expanded. Not saved, so not a change to the game.
export const setCardOpen = (state: GameState, target: number | CardTarget, isOpen: boolean): GameState => {
  const at = locate(state, asTarget(target));
  if (!at) { return state; }
  return mapCard(state, at, (card) => ({ ...card, editorOpen: isOpen }));
};

/**
 * Replaces one deck's cards, e.g. after a drag reorder. Defaults to the active
 * deck, which is what a single-deck editor passes.
 */
export const setList = (state: GameState, list: Card[], deckId?: string): GameState => {
  const target = deckId ?? selectActiveDeck(state).id;
  if (!state.decks.some((deck) => deck.id === target)) { return state; }
  return {
    ...withDecks(
      state,
      state.decks.map((deck) => (deck.id === target ? { ...deck, cards: list } : deck)),
    ),
    isDirty: true,
  };
};

/**
 * Appends a card to the active deck, or to the given deck id. This is the only
 * transition that creates a blank draft card (emptyCard), and a save drops it
 * until the author fills it in.
 */
export const addCard = (state: GameState, card: Card = emptyCard(), deckId?: string): GameState => {
  const target = deckId ?? selectActiveDeck(state).id;
  if (!state.decks.some((deck) => deck.id === target)) { return state; }
  return {
    ...withDecks(
      state,
      state.decks.map((deck) => (
        deck.id === target ? { ...deck, cards: [...deck.cards, card] } : deck
      )),
    ),
    isDirty: true,
  };
};

/** Removes a card by position in the active deck, or by id from any deck. */
export const removeCard = (state: GameState, target: number | CardTarget): GameState => {
  const at = locate(state, asTarget(target));
  if (!at) { return state; }
  return {
    ...withDecks(
      state,
      state.decks.map((deck, deckIndex) => (
        deckIndex === at.deck
          ? { ...deck, cards: deck.cards.filter((_, cardIndex) => cardIndex !== at.card) }
          : deck
      )),
    ),
    isDirty: true,
  };
};

/**
 * Switches the deck being edited. Navigation, not a change to the game, so it
 * does not mark the state dirty and invents no card: an empty deck stays empty,
 * and a draft comes only from addCard.
 */
export const selectDeck = (state: GameState, deckId: string): GameState => {
  const deck = state.decks.find((candidate) => candidate.id === deckId);
  if (!deck || deck.id === state.activeDeckId) { return state; }
  return withDecks(state, state.decks, deckId);
};

/** The next free "Deck N" name, so a new deck does not start out invalid. */
const nextDeckName = (decks: Deck[]): string => {
  const names = new Set(decks.map((deck) => deck.name.trim().toLowerCase()));
  let number = decks.length + 1;
  while (names.has(`deck ${number}`)) { number += 1; }
  return `Deck ${number}`;
};

/** Appends a new deck and edits it. */
export const addDeck = (state: GameState, name: string = nextDeckName(state.decks)): GameState => {
  const deck = newDeck(name);
  return { ...withDecks(state, [...state.decks, deck], deck.id), isDirty: true };
};

/** Deck names are validated (required, unique ignoring case) before a save. */
export const renameDeck = (state: GameState, deckId: string, name: string): GameState => {
  if (!state.decks.some((deck) => deck.id === deckId)) { return state; }
  return {
    ...withDecks(state, state.decks.map((deck) => (deck.id === deckId ? { ...deck, name } : deck))),
    isDirty: true,
  };
};

/** Removes a deck and its cards. The last deck cannot be deleted. */
export const deleteDeck = (state: GameState, deckId: string): GameState => {
  const index = state.decks.findIndex((deck) => deck.id === deckId);
  if (index < 0 || state.decks.length <= 1) { return state; }
  const decks = state.decks.filter((deck) => deck.id !== deckId);
  const activeDeckId = deckId === state.activeDeckId
    ? decks[Math.min(index, decks.length - 1)].id
    : state.activeDeckId;
  return { ...withDecks(state, decks, activeDeckId), isDirty: true };
};

/**
 * Moves a deck to `toIndex`, a position in the final list: [A, B, C] moving A
 * to 1 is [B, A, C], to 2 is [B, C, A]. The index is a whole number in the list
 * - a fraction is truncated - and clamped to it, so a caller may pass any slot
 * it drew.
 *
 * The deck object itself moves, so its `deck_key`, name and every card travel
 * with it and `activeDeckId` still names the same deck. Deck order is what the
 * block saves, and the first deck is the primary one whose cards are the legacy
 * `cards` mirror: moving a deck to 0 changes what that mirror holds.
 */
export const moveDeck = (state: GameState, deckId: string, toIndex: number): GameState => {
  // Not a position: clamping NaN would silently move the deck to the front, and
  // dirty the state for a move nobody asked for.
  if (Number.isNaN(toIndex)) { return state; }
  const fromIndex = state.decks.findIndex((deck) => deck.id === deckId);
  if (fromIndex < 0) { return state; }
  // Truncated before the comparison: splice would truncate a fraction anyway,
  // and a slot that lands back on the deck is no move.
  const index = Math.max(0, Math.min(Math.trunc(toIndex), state.decks.length - 1));
  // The one same-position check, after clamping: a slot that lands back on the
  // deck is no move, and must not dirty the state.
  if (index === fromIndex) { return state; }
  const decks = [...state.decks];
  const [deck] = decks.splice(fromIndex, 1);
  decks.splice(index, 0, deck);
  return { ...withDecks(state, decks), isDirty: true };
};

/**
 * A card the author has not filled in yet: an explicit blank draft from addCard.
 * A blank card the block already keyed is authored content and is never dropped.
 * The one rule: a save drops these, a reorder leaves one last, moveCard refuses
 * to move one, and the drag resolver refuses to start a drag from one.
 */
export const isBlankCard = (card: Card) => (
  !card.card_key
  && !card.term.trim() && !card.definition.trim() && !card.term_image && !card.definition_image
);

/** The deck's cards without its first keyless blank draft, if any. */
const dropOnePlaceholder = (cards: Card[]): Card[] => {
  const index = cards.findIndex(isBlankCard);
  if (index < 0) { return cards; }
  return [...cards.slice(0, index), ...cards.slice(index + 1)];
};

/** True when both lists hold the same cards in the same order. */
const sameCardOrder = (a: Card[], b: Card[]): boolean =>
  a.length === b.length && a.every((card, index) => card === b[index]);

/**
 * The deck's cards with its blank draft last, the only place a caller may read
 * it: a real card beside the draft is a deck edge (see menuMoveTarget). The
 * draft object itself is kept, never copied.
 */
const draftLast = (cards: Card[]): Card[] => {
  const draftAt = cards.findIndex(isBlankCard);
  if (draftAt < 0 || draftAt === cards.length - 1) { return cards; }
  return [...cards.slice(0, draftAt), ...cards.slice(draftAt + 1), cards[draftAt]];
};

/**
 * Moves a card to `target.index` in `target.deckId`, in one path for both a
 * reorder and a move to another deck. The index counts positions in the target
 * deck after the card has left its source deck but before that deck's blank
 * draft is dropped, which is the deck as a caller draws it (see
 * resolveCardDrop). It is clamped, so a caller appending to a deck may pass
 * that deck's current length.
 *
 * The card object itself moves, so its id (uploads target it), `card_key`
 * (the block's identity), images and `editorOpen` go with it, and deck order is
 * untouched. A real card entering another deck replaces that deck's blank
 * draft, which is editor state rather than content; within one deck nothing
 * enters, so the deck keeps its own draft, last.
 *
 * Decks only, no editor state, so a drag preview can ask for the same move. The
 * decks are returned as they were given when nothing moves - a caller compares
 * arrays to know there is nothing new to render - and `index` is where the
 * card actually ends up: its final position on a move, the position it kept
 * when nothing moved, and -1 only when no deck holds the card at all.
 */
export const moveCardInDecks = (
  decks: Deck[],
  cardId: string,
  target: CardDropTarget,
): { decks: Deck[]; index: number; } => {
  const source = findCardLocation(decks, cardId);
  const toDeckIndex = decks.findIndex((deck) => deck.id === target.deckId);
  if (!source || toDeckIndex < 0) { return { decks, index: source ? source.index : -1 }; }
  const { deckIndex: fromDeckIndex, deck: fromDeck, index: fromIndex } = source;
  // Not a position: clamping NaN would silently put the card first, and dirty
  // the state for a move nobody asked for.
  if (Number.isNaN(target.index)) { return { decks, index: fromIndex }; }
  const card = fromDeck.cards[fromIndex];
  // A keyless blank card is an explicit editing draft, not content: it has
  // nothing to move, and dragging it would invent a card in the target.
  if (isBlankCard(card)) { return { decks, index: fromIndex }; }
  const sameDeck = fromDeckIndex === toDeckIndex;
  const remaining = fromDeck.cards.filter((_, index) => index !== fromIndex);
  // The target deck as the caller counts positions in it. Within one deck that
  // is just the cards minus this one.
  const enteredCards = sameDeck ? remaining : decks[toDeckIndex].cards;
  // Only a card entering another deck meets its blank draft; within one deck
  // nothing enters, so its own draft stays with it.
  const scaffold = sameDeck ? -1 : enteredCards.findIndex(isBlankCard);
  const targetCards = scaffold < 0 ? enteredCards : dropOnePlaceholder(enteredCards);
  // Dropping a blank draft above the requested gap shifts that gap up by one.
  const gap = scaffold >= 0 && scaffold < target.index ? target.index - 1 : target.index;
  const index = Math.max(0, Math.min(gap, targetCards.length));
  const placed = [...targetCards.slice(0, index), card, ...targetCards.slice(index)];
  // Within one deck the draft is kept, but last: whatever gap the caller drew,
  // the deck still reads as its real cards and then its draft.
  const cards = sameDeck ? draftLast(placed) : placed;
  // Where the card really ends up: the gap above may be a fraction, so neither
  // it nor the clamp is the position to report back.
  const placedIndex = cards.findIndex((entry) => entry.id === cardId);
  if (sameDeck) {
    // The same cards in the same order is no move, and must not dirty the state.
    if (sameCardOrder(cards, fromDeck.cards)) { return { decks, index: fromIndex }; }
    return {
      decks: decks.map((deck, deckIndex) => (deckIndex === fromDeckIndex ? { ...deck, cards } : deck)),
      index: placedIndex,
    };
  }
  return {
    decks: decks.map((deck, deckIndex) => {
      if (deckIndex === fromDeckIndex) { return { ...deck, cards: remaining }; }
      if (deckIndex === toDeckIndex) { return { ...deck, cards: placed }; }
      return deck;
    }),
    index: placedIndex,
  };
};

/**
 * A card move as a state transition: `moveCardInDecks` does the work, in the
 * frame documented there, and the state comes back unchanged when the decks did.
 */
export const moveCard = (state: GameState, cardId: string, target: CardDropTarget): GameState => {
  const moved = moveCardInDecks(state.decks, cardId, target);
  if (moved.decks === state.decks) { return state; }
  return { ...withDecks(state, moved.decks), isDirty: true };
};

/** One card from a `get_settings` card object, with editor defaults filled in. */
const cardFromSettings = (card: Partial<Card>): Card => ({
  ...emptyCard(),
  // A loaded card starts collapsed: the outline is a list to scan, not a form
  // to fill in. Adding or opening a card still shows its fields.
  editorOpen: false,
  card_key: card.card_key,
  term: card.term || '',
  // Image URLs are kept as the block returns them (relative to its Studio);
  // the view resolves them for display. See imageDisplayUrl.
  term_image: card.term_image || '',
  term_image_path: card.term_image_path || '',
  term_image_alt: card.term_image_alt || '',
  definition: card.definition || '',
  definition_image: card.definition_image || '',
  definition_image_path: card.definition_image_path || '',
  definition_image_alt: card.definition_image_alt || '',
});

/** A loaded deck's cards. An empty deck stays empty: no draft card is invented. */
const editableCards = (cards: unknown): Card[] => (Array.isArray(cards) ? cards : []).map(cardFromSettings);

const deckFromSettings = (deck: SettingsDeck | null | undefined, index: number): Deck => {
  const name = typeof deck?.name === 'string' ? deck.name.trim() : '';
  return {
    id: uuidv4(),
    deck_key: typeof deck?.deck_key === 'string' ? deck.deck_key : undefined,
    // A deck without a usable name is renamed for display only; saving the
    // block stores whatever the author then confirms.
    name: name || `Deck ${index + 1}`,
    cards: editableCards(deck?.cards),
  };
};

/**
 * The decks a `get_settings` response describes. A backend that predates
 * decks (or a fresh block) sends no `decks`, so its `cards` is one deck.
 */
export const decksFromSettings = (data: SettingsResponse): Deck[] => {
  const stored = Array.isArray(data.decks) ? data.decks : [];
  if (stored.length) { return stored.map(deckFromSettings); }
  return [
    {
      id: uuidv4(),
      name: DEFAULT_DECK_NAME,
      cards: editableCards(data.cards),
    },
  ];
};

/** The freshly fetched settings replace whatever was there, clean and loaded. */
export const loaded = (value: GameState): GameState => ({
  ...withDecks(value, value.decks, value.activeDeckId),
  isDirty: false,
  isLoaded: true,
  error: null,
});

/** The state one `get_settings` response describes, seeded and loaded. */
export const stateFromSettings = (data: SettingsResponse): GameState => {
  const decks = decksFromSettings(data);
  return loaded({
    ...initialState,
    type: data.game_type || 'flashcards',
    settings: {
      shuffle: data.is_shuffled !== undefined ? data.is_shuffled : true,
      timer: data.has_timer !== undefined ? data.has_timer : true,
    },
    decks,
    activeDeckId: decks[0].id,
    list: decks[0].cards,
    // Only a backend that sent a decks array can be saved with one.
    supportsDecks: Array.isArray(data.decks),
  });
};

export const setError = (state: GameState, error: Error): GameState => ({ ...state, error });

export const setLoadError = (state: GameState, error: Error): GameState => ({ ...state, error, loadFailed: true });

export const clearError = (state: GameState): GameState => ({ ...state, error: null, loadFailed: false });

export const setDirty = (state: GameState): GameState => ({ ...state, isDirty: true });
