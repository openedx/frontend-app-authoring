import type { Card, FlashcardsState } from './types';

/** Why a field failed validation: missing text, or an image with no text beside it. */
export type FieldError = true | 'imageWithoutText';

/** Keyed `${cardId}_${field}` (see fieldKey). */
export type ValidationErrors = Record<string, FieldError>;

/** The two free-text fields of a card. */
export type TextField = 'term' | 'definition';

/**
 * Key for per-card, per-field validation errors. Built from the card key, not
 * its position, so reordering cannot mis-attach it. Card keys are
 * uuids and never contain `_`, so the field can be split off again
 * at the last `_` (see cardKeyOf).
 */
export const fieldKey = (cardKey: string, field: TextField) => `${cardKey}_${field}`;

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

/** The card_key a fieldKey was built from. */
export const cardKeyOf = (key: string) => key.slice(0, key.lastIndexOf('_'));

/** What the editor saves: blank cards are dropped. Only flashcards can carry an image without text. */
export const getContent = ({ settings, list }: Pick<FlashcardsState, 'settings' | 'list'>) => {
  const hasText = (card: Card) => (card.term || '').trim() !== '' || (card.definition || '').trim() !== '';
  const hasImage = (card: Card) => !!card.term_image || !!card.definition_image;
  const cards = list.filter((card) => hasText(card) || hasImage(card));
  return {
    isShuffled: settings.shuffle,
    cards,
  };
};

/**
 * Pure, so it can run against state that has not been rendered yet: the save
 * revalidates once pending image requests have settled.
 */
export const validateCards = ({ list }: Pick<FlashcardsState, 'list'>) => {
  const errors: ValidationErrors = {};

  list.forEach((card) => {
    const termEmpty = !card.term.trim();
    const definitionEmpty = !card.definition.trim();
    const hasTermImage = !!card.term_image;
    const hasDefinitionImage = !!card.definition_image;

    if (termEmpty && definitionEmpty) {
      // For flashcards, if there's an image but no text, show validation error
      if (hasTermImage || hasDefinitionImage) {
        if (hasTermImage) {
          errors[fieldKey(card.card_key, 'term')] = 'imageWithoutText';
        }
        if (hasDefinitionImage) {
          errors[fieldKey(card.card_key, 'definition')] = 'imageWithoutText';
        }
      }
      return;
    }

    if (termEmpty && !definitionEmpty) {
      errors[fieldKey(card.card_key, 'term')] = true;
    }

    if (!termEmpty && definitionEmpty) {
      errors[fieldKey(card.card_key, 'definition')] = true;
    }

    if (hasTermImage && termEmpty) {
      errors[fieldKey(card.card_key, 'term')] = 'imageWithoutText';
    }
    if (hasDefinitionImage && definitionEmpty) {
      errors[fieldKey(card.card_key, 'definition')] = 'imageWithoutText';
    }
  });

  // An empty list is valid: the block accepts it, and a blank placeholder
  // card already saves as one (getContent drops it). Only real field and
  // image errors block a save.
  return { errors, isValid: Object.keys(errors).length === 0 };
};
