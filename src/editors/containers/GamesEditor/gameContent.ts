import { DEFAULT_DECK_NAME } from './data/gameTransitions';
import type { Card, Deck, DeckNameError, GameState, GameType } from './types';

/** Why a field failed validation: missing text, or an image with no text beside it. */
export type FieldError = true | 'imageWithoutText';

/** Keyed `${cardId}_${field}` (see fieldKey). */
export type ValidationErrors = Record<string, FieldError>;

/** Keyed by the deck's local id, which survives a rename, so it stays attached. */
export type DeckValidationErrors = Record<string, DeckNameError>;

/** The two free-text fields of a card. */
export type TextField = 'term' | 'definition';

/**
 * Key for per-card, per-field validation errors. Built from the card id, not
 * its position, so reordering cannot mis-attach it. Card ids are uuids and
 * never contain `_`, so the field can be split off again at the last `_`
 * (see cardIdOf).
 */
export const fieldKey = (cardId: string, field: TextField) => `${cardId}_${field}`;

/**
 * Where to show an image from. The block's upload handler returns a URL
 * relative to its own Studio (`/media/...`), which is what the card stores and
 * saves, so learner content never names the Studio host. The editor runs on
 * a different origin, so it adds the host when it renders.
 */
export const imageDisplayUrl = (url: string, studioEndpointUrl: string): string => {
  if (!url || url.startsWith('http')) { return url; }
  return `${studioEndpointUrl}${url}`;
};

/**
 * The alt the block gives learners: the saved alt text, or the card's own
 * text when there is none. The editor's preview shows the same.
 */
export const imageAlt = (altText: string, cardText: string): string => altText || cardText;

/** The card id a fieldKey was built from. */
export const cardIdOf = (key: string) => key.slice(0, key.lastIndexOf('_'));

/**
 * The cards one deck saves. A completely blank card is an explicit editing
 * draft from addCard and is dropped, unless the block already gave it a key:
 * then it is authored content the author emptied. It is kept here so the card
 * is not silently deleted, and validation stops the save until it is filled in
 * or removed. Only flashcards can carry an image without text.
 */
const contentCards = (cards: Card[], type: GameType) => {
  const hasText = (card: Card) => (card.term || '').trim() !== '' || (card.definition || '').trim() !== '';
  const hasImage = (card: Card) => !!card.term_image || !!card.definition_image;
  return cards.filter((card) => {
    if (hasText(card) || (type === 'flashcards' && hasImage(card))) { return true; }
    return !hasImage(card) && !!card.card_key;
  });
};

/**
 * What the editor saves: every deck, and the first deck's cards as the
 * block's legacy `cards` field. `decks` is optional so the single-list view
 * can keep asking about the cards it renders.
 */
export const getContent = ({ type, settings, decks, list }: Pick<GameState, 'type' | 'settings' | 'list'> & {
  decks?: Deck[];
}) => {
  const sources = decks?.length ? decks : [{ id: '', name: DEFAULT_DECK_NAME, cards: list }];
  return {
    gameType: type,
    isShuffled: settings.shuffle,
    hasTimer: settings.timer,
    // The first deck is the block's primary deck: its `cards` field.
    cards: contentCards(sources[0].cards, type),
    decks: sources.map((deck) => ({
      deckKey: deck.deck_key,
      name: deck.name,
      cards: contentCards(deck.cards, type),
    })),
  };
};

/** Records every field, image and empty-card error a card has. */
const cardErrors = (card: Card, type: GameType, errors: ValidationErrors) => {
  const termEmpty = !card.term.trim();
  const definitionEmpty = !card.definition.trim();
  const hasTermImage = !!card.term_image;
  const hasDefinitionImage = !!card.definition_image;

  if (termEmpty && definitionEmpty) {
    // For flashcards, if there's an image but no text, show validation error
    if (type === 'flashcards' && (hasTermImage || hasDefinitionImage)) {
      if (hasTermImage) {
        errors[fieldKey(card.id, 'term')] = 'imageWithoutText';
      }
      if (hasDefinitionImage) {
        errors[fieldKey(card.id, 'definition')] = 'imageWithoutText';
      }
      return;
    }
    // A completely blank card the block already keyed was authored content the
    // author emptied: saving it would show learners an empty card, so it has to
    // be filled in. An unkeyed blank card is only an explicit editing draft.
    if (!hasTermImage && !hasDefinitionImage && card.card_key) {
      errors[fieldKey(card.id, 'term')] = true;
      errors[fieldKey(card.id, 'definition')] = true;
    }
    return;
  }

  if (termEmpty && !definitionEmpty) {
    errors[fieldKey(card.id, 'term')] = true;
  }

  if (!termEmpty && definitionEmpty) {
    errors[fieldKey(card.id, 'definition')] = true;
  }

  // For flashcards, validate that images have accompanying text
  if (type === 'flashcards') {
    if (hasTermImage && termEmpty) {
      errors[fieldKey(card.id, 'term')] = 'imageWithoutText';
    }
    if (hasDefinitionImage && definitionEmpty) {
      errors[fieldKey(card.id, 'definition')] = 'imageWithoutText';
    }
  }
};

/**
 * Deck names are required and unique ignoring case; both sides of a clash are
 * flagged. Keyed by deck id, not position, so a rename or reorder keeps it.
 * The one implementation of the rule: the editor shows these while the author
 * types and `validateCards` blocks a save on them.
 */
export const getDeckNameErrors = (decks: Deck[]): DeckValidationErrors => {
  const counts = new Map<string, number>();
  decks.forEach((deck) => {
    const name = deck.name.trim().toLowerCase();
    counts.set(name, (counts.get(name) || 0) + 1);
  });
  const errors: DeckValidationErrors = {};
  decks.forEach((deck) => {
    const name = deck.name.trim();
    if (!name) {
      errors[deck.id] = 'required';
    } else if ((counts.get(name.toLowerCase()) || 0) > 1) {
      errors[deck.id] = 'duplicate';
    }
  });
  return errors;
};

/**
 * Pure, so it can run against state that has not been rendered yet: the save
 * revalidates once pending image requests have settled. Cards are validated
 * in every deck. The block validates deck names whenever it receives decks,
 * Matching included, so those errors block a save wherever the backend
 * supports decks; an older block has no deck fields and stays cards-only.
 */
export const validateCards = ({ decks, list, type, supportsDecks }: Pick<GameState, 'type' | 'list'> & {
  decks?: Deck[];
  supportsDecks?: boolean;
}) => {
  const errors: ValidationErrors = {};
  const sources = decks?.length ? decks : [{ id: '', name: '', cards: list }];

  sources.forEach((deck) => deck.cards.forEach((card) => cardErrors(card, type, errors)));

  const deckErrors = decks?.length ? getDeckNameErrors(decks) : {};
  // A backend that declared decks validates their names on every save, whatever
  // the game type. An older backend receives no decks, so names cannot block.
  const deckNamesBlock = supportsDecks === true;

  // An empty deck is valid: the block accepts it, and a blank draft card
  // already saves as none (getContent drops it). Only real field, image
  // and actionable deck-name errors block a save.
  return {
    errors,
    deckErrors,
    isValid: Object.keys(errors).length === 0 && !(deckNamesBlock && Object.keys(deckErrors).length > 0),
  };
};
