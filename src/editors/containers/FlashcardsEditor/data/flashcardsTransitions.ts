import { v4 as uuidv4 } from 'uuid';

import type { Card, FlashcardsSettings, FlashcardsState } from '@src/editors/containers/FlashcardsEditor/types';

/**
 * Pure transitions on the editor's state. Each returns a new state, or the
 * same object when there is nothing to change. `useFlashcardsState` applies them
 * through its store; they are kept apart so they can be tested on their own.
 */

export const emptyCard = (): Card => ({
  card_key: uuidv4(),
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

export const initialState: FlashcardsState = {
  settings: { shuffle: true },
  list: [emptyCard()],
  isDirty: false,
  isLoaded: false,
  // Any failed request (load, save, image upload). Rendered by the editor.
  error: null,
  // True when the settings fetch itself failed, so the editor can offer a
  // retry instead of a spinner that never ends.
  loadFailed: false,
};

export type CardField = Exclude<keyof Card, 'card_key'>;
/**
 * Which card an edit targets. Synchronous edits name a position. Async work
 * (an image upload) names the card's id, because its position may have
 * changed by the time the request settles.
 */
export type CardTarget = { index: number; cardKey?: undefined; } | { cardKey: string; index?: undefined; };

const indexOf = (state: FlashcardsState, target: CardTarget): number => (
  target.cardKey != null ? state.list.findIndex((card) => card.card_key === target.cardKey) : target.index
);

export const updateSetting = (
  state: FlashcardsState,
  key: keyof FlashcardsSettings,
  value: boolean,
): FlashcardsState => ({
  ...state,
  settings: { ...state.settings, [key]: value },
  isDirty: true,
});

export const updateCardField = (
  state: FlashcardsState,
  target: CardTarget,
  field: CardField,
  value: string | boolean,
): FlashcardsState => {
  const index = indexOf(state, target);
  if (index < 0 || !state.list[index]) { return state; }
  return {
    ...state,
    list: state.list.map((card, idx) => (idx === index ? { ...card, [field]: value } : card)),
    isDirty: true,
  };
};

// UI only: whether a card is expanded. Not saved, so not a change to the game.
export const setCardOpen = (state: FlashcardsState, index: number, isOpen: boolean): FlashcardsState => {
  if (!state.list[index]) { return state; }
  return {
    ...state,
    list: state.list.map((card, idx) => (idx === index ? { ...card, editorOpen: isOpen } : card)),
  };
};

export const setList = (state: FlashcardsState, list: Card[]): FlashcardsState => ({ ...state, list, isDirty: true });

export const addCard = (state: FlashcardsState, card: Card = emptyCard()): FlashcardsState => ({
  ...state,
  list: [...state.list, card],
  isDirty: true,
});

export const removeCard = (state: FlashcardsState, index: number): FlashcardsState => {
  if (index < 0 || index >= state.list.length) { return state; }
  return {
    ...state,
    list: state.list.filter((_, idx) => idx !== index),
    isDirty: true,
  };
};

/** The freshly fetched settings replace whatever was there, clean and loaded. */
export const loaded = (value: FlashcardsState): FlashcardsState => ({
  ...value,
  isDirty: false,
  isLoaded: true,
  error: null,
});

export const setError = (state: FlashcardsState, error: Error): FlashcardsState => ({ ...state, error });

export const setLoadError = (state: FlashcardsState, error: Error): FlashcardsState => ({
  ...state,
  error,
  loadFailed: true,
});

export const clearError = (state: FlashcardsState): FlashcardsState => ({ ...state, error: null, loadFailed: false });

export const setDirty = (state: FlashcardsState): FlashcardsState => ({ ...state, isDirty: true });
