import type { Card, GameState } from './types';

/** Why a field failed validation: missing text, or an image with no text beside it. */
export type FieldError = true | 'imageWithoutText';

/** Keyed `${cardId}_${field}` (see fieldKey). */
export type ValidationErrors = Record<string, FieldError>;

/** The two free-text fields of a card. */
export type TextField = 'term' | 'definition';

/**
 * Key for per-card, per-field validation errors. Built from the card id, not
 * its position, so reordering cannot mis-attach it. Card ids are
 * `card-<time>-<n>` and never contain `_`, so the field can be split off again
 * at the last `_` (see cardIdOf).
 */
export const fieldKey = (cardId: string, field: TextField) => `${cardId}_${field}`;

/** The card id a fieldKey was built from. */
export const cardIdOf = (key: string) => key.slice(0, key.lastIndexOf('_'));

/** What the editor saves: blank cards are dropped. Only flashcards can carry an image without text. */
export const getContent = ({ type, settings, list }: Pick<GameState, 'type' | 'settings' | 'list'>) => {
  const hasText = (card: Card) => (card.term || '').trim() !== '' || (card.definition || '').trim() !== '';
  const hasImage = (card: Card) => !!card.term_image || !!card.definition_image;
  const cards = list.filter((card) => hasText(card) || (type === 'flashcards' && hasImage(card)));
  return {
    gameType: type,
    isShuffled: settings.shuffle,
    hasTimer: settings.timer,
    cards,
  };
};

/**
 * Pure, so it can run against state that has not been rendered yet: the save
 * revalidates once pending image requests have settled.
 */
export const validateCards = ({ list, type }: Pick<GameState, 'list' | 'type'>) => {
  const errors: ValidationErrors = {};

  list.forEach((card) => {
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
  });

  // An empty list is valid: the block accepts it, and a blank placeholder
  // card already saves as one (getContent drops it). Only real field and
  // image errors block a save.
  return { errors, isValid: Object.keys(errors).length === 0 };
};
