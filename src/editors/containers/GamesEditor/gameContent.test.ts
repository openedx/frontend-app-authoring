import { emptyCard } from './data/gameTransitions';
import { fieldKey, getContent, getDeckNameErrors, validateCards } from './gameContent';
import type { Card, Deck } from './types';

const settings = { shuffle: true, timer: true };

const card = (overrides: Partial<Card> = {}): Card => ({ ...emptyCard(), ...overrides });
const deck = (id: string, name: string, cards: Card[]): Deck => ({ id, name, cards });

describe('getContent', () => {
  // A blank card is an explicit draft from Add; it must never reach the
  // payload, in any deck.
  it('drops blank draft cards in every deck and mirrors the first deck in cards', () => {
    const content = getContent({
      type: 'flashcards',
      settings,
      list: [],
      decks: [
        deck('d1', 'Basics', [card({ term: 'a', definition: 'b' }), emptyCard()]),
        deck('d2', 'Advanced', [emptyCard()]),
      ],
    });

    expect(content.decks.map((entry) => entry.name)).toEqual(['Basics', 'Advanced']);
    expect(content.decks[0].cards.map((entry) => entry.term)).toEqual(['a']);
    expect(content.decks[1].cards).toEqual([]);
    // `cards` is the block's legacy field: the first deck only.
    expect(content.cards).toEqual(content.decks[0].cards);
  });

  // A blank card the block already keyed was authored and emptied; dropping it
  // would delete the card. Only an unkeyed draft is dropped.
  it('preserves an authored blank card the block already keyed', () => {
    const content = getContent({
      type: 'flashcards',
      settings,
      list: [],
      decks: [deck('d1', 'Deck 1', [card({ card_key: 'k-1' }), emptyCard()])],
    });

    expect(content.decks[0].cards).toHaveLength(1);
    expect(content.decks[0].cards[0].card_key).toEqual('k-1');
    expect(content.cards).toEqual(content.decks[0].cards);
  });

  it('keeps the single-list shape the built-in view asks for', () => {
    const content = getContent({ type: 'flashcards', settings, list: [card({ term: 'a', definition: 'b' })] });

    expect(content.cards.map((entry) => entry.term)).toEqual(['a']);
    expect(content.decks).toHaveLength(1);
    expect(content.decks[0].name).toEqual('Deck 1');
  });

  it('keeps an image-only card for flashcards but not for matching, in any deck', () => {
    const decks = () => [
      deck('d1', 'Basics', [card({ term_image: '/media/a.png' })]),
      deck('d2', 'Advanced', [card({ definition_image: '/media/b.png' })]),
    ];

    const flashcards = getContent({ type: 'flashcards', settings, list: [], decks: decks() });
    expect(flashcards.decks.map((entry) => entry.cards.length)).toEqual([1, 1]);

    const matching = getContent({ type: 'matching', settings, list: [], decks: decks() });
    expect(matching.decks.map((entry) => entry.cards.length)).toEqual([0, 0]);
  });
});

describe('validateCards', () => {
  it('validates the cards of every deck, keyed by card id', () => {
    const bad = card({ id: 'card-bad', term: 'a' });

    const { errors, isValid } = validateCards({
      type: 'flashcards',
      list: [],
      decks: [deck('d1', 'Basics', [card({ term: 'a', definition: 'b' })]), deck('d2', 'Advanced', [bad])],
    });

    expect(isValid).toBe(false);
    expect(errors[fieldKey('card-bad', 'definition')]).toBe(true);
    expect(Object.keys(errors)).toHaveLength(1);
  });

  // The mirror of the case above, and the one CardField shows as "Enter a term":
  // the term is the field that has to be fixed, so the error names it and not
  // the definition the author already filled in.
  it('marks the term invalid, and not the definition, when only the definition is filled', () => {
    const half = card({ id: 'card-half', definition: 'b' });

    const { errors, isValid } = validateCards({
      type: 'matching',
      list: [],
      decks: [deck('d1', 'Basics', [half])],
    });

    expect(errors).toEqual({ [fieldKey('card-half', 'term')]: true });
    expect(errors[fieldKey('card-half', 'definition')]).toBeUndefined();
    expect(isValid).toBe(false);
  });

  it('requires a name per deck and unique names ignoring case, keyed by deck id', () => {
    const { errors, deckErrors, isValid } = validateCards({
      type: 'flashcards',
      supportsDecks: true,
      list: [],
      decks: [
        deck('d1', '  ', [card({ term: 'a', definition: 'b' })]),
        deck('d2', 'Basics', []),
        deck('d3', ' basics ', []),
      ],
    });

    expect(isValid).toBe(false);
    expect(deckErrors).toEqual({ d1: 'required', d2: 'duplicate', d3: 'duplicate' });
    expect(errors).toEqual({});
  });

  // One implementation of the rule, so the editor's live messages and the
  // save gate cannot drift apart.
  it('exposes the deck-name rule on its own for the editor to show', () => {
    expect(getDeckNameErrors([deck('d1', 'Basics', []), deck('d2', ' basics', [])])).toEqual({
      d1: 'duplicate',
      d2: 'duplicate',
    });
    expect(getDeckNameErrors([deck('d1', 'Basics', []), deck('d2', 'Advanced', [])])).toEqual({});
  });

  // An older block has no deck fields and receives no decks, so a stored name
  // cannot block its save.
  it('reports deck-name errors without blocking an older backend save', () => {
    const { deckErrors, isValid } = validateCards({
      type: 'flashcards',
      supportsDecks: false,
      list: [],
      decks: [deck('d1', '', []), deck('d2', '', [])],
    });

    expect(deckErrors).toEqual({ d1: 'required', d2: 'required' });
    expect(isValid).toBe(true);
  });

  // The block validates deck names whenever it receives decks, so Matching
  // blocks on them too rather than sending a payload the block would reject.
  it('blocks a matching save on deck-name errors', () => {
    const { deckErrors, isValid } = validateCards({
      type: 'matching',
      supportsDecks: true,
      list: [],
      decks: [deck('d1', 'Basics', []), deck('d2', 'basics', [])],
    });

    expect(deckErrors).toEqual({ d1: 'duplicate', d2: 'duplicate' });
    expect(isValid).toBe(false);
  });

  // A blank card the block already keyed is authored content: saving it would
  // show learners an empty card, so the save stops on it instead.
  it('flags a keyed blank card as an empty card', () => {
    const blank = card({ id: 'card-blank', card_key: 'k-1' });
    const { errors, isValid } = validateCards({
      type: 'flashcards',
      supportsDecks: true,
      list: [],
      decks: [deck('d1', 'Deck 1', [blank])],
    });

    expect(errors[fieldKey('card-blank', 'term')]).toBe(true);
    expect(errors[fieldKey('card-blank', 'definition')]).toBe(true);
    expect(isValid).toBe(false);
  });

  // The unkeyed blank card is an explicit draft from Add; it is not content.
  it('accepts an unkeyed blank draft card', () => {
    const { errors, isValid } = validateCards({
      type: 'flashcards',
      supportsDecks: true,
      list: [],
      decks: [deck('d1', 'Deck 1', [emptyCard()])],
    });

    expect(errors).toEqual({});
    expect(isValid).toBe(true);
  });

  // The image-without-text rule is unchanged by the blank-card rule above.
  it('keeps the image-without-text rule for a blank card with an image', () => {
    const withImage = card({ id: 'card-img', term_image: '/media/a.png' });
    const { errors } = validateCards({
      type: 'flashcards',
      supportsDecks: true,
      list: [],
      decks: [deck('d1', 'Deck 1', [withImage])],
    });

    expect(errors[fieldKey('card-img', 'term')]).toBe('imageWithoutText');
    expect(errors[fieldKey('card-img', 'definition')]).toBeUndefined();
  });

  it('accepts unique names and empty decks', () => {
    const { isValid, deckErrors } = validateCards({
      type: 'flashcards',
      supportsDecks: true,
      list: [],
      decks: [deck('d1', 'Basics', []), deck('d2', 'Advanced', [])],
    });

    expect(deckErrors).toEqual({});
    expect(isValid).toBe(true);
  });

  // The built-in view only knows the cards it renders, so it must not invent
  // deck-name errors for decks it cannot see.
  it('does not check names when it is given only a card list', () => {
    const { isValid, deckErrors } = validateCards({ type: 'flashcards', list: [card({ term: 'a', definition: 'b' })] });

    expect(deckErrors).toEqual({});
    expect(isValid).toBe(true);
  });
});
