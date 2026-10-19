import { v4 as uuidv4 } from 'uuid';

import type { Card, GameSettings, GameState, GameType } from '@src/editors/containers/GamesEditor/types';

/**
 * Pure transitions on the editor's state. Each returns a new state, or the
 * same object when there is nothing to change. `useGameState` applies them
 * through its store; they are kept apart so they can be tested on their own.
 */

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

export const initialState: GameState = {
  settings: { shuffle: true, timer: true },
  type: 'flashcards',
  list: [emptyCard()],
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
 * Which card an edit targets. Synchronous edits name a position. Async work
 * (an image upload) names the card's id, because its position may have
 * changed by the time the request settles.
 */
export type CardTarget = { index: number; cardId?: undefined; } | { cardId: string; index?: undefined; };

const indexOf = (state: GameState, target: CardTarget): number => (
  target.cardId != null ? state.list.findIndex((card) => card.id === target.cardId) : target.index
);

export const updateSetting = (state: GameState, key: keyof GameSettings, value: boolean): GameState => ({
  ...state,
  settings: { ...state.settings, [key]: value },
  isDirty: true,
});

export const updateType = (state: GameState, value: GameType): GameState => ({ ...state, type: value, isDirty: true });

export const updateCardField = (
  state: GameState,
  target: CardTarget,
  field: CardField,
  value: string | boolean,
): GameState => {
  const index = indexOf(state, target);
  if (index < 0 || !state.list[index]) { return state; }
  return {
    ...state,
    list: state.list.map((card, idx) => (idx === index ? { ...card, [field]: value } : card)),
    isDirty: true,
  };
};

// UI only: whether a card is expanded. Not saved, so not a change to the game.
export const setCardOpen = (state: GameState, index: number, isOpen: boolean): GameState => {
  if (!state.list[index]) { return state; }
  return {
    ...state,
    list: state.list.map((card, idx) => (idx === index ? { ...card, editorOpen: isOpen } : card)),
  };
};

export const setList = (state: GameState, list: Card[]): GameState => ({ ...state, list, isDirty: true });

export const addCard = (state: GameState, card: Card = emptyCard()): GameState => ({
  ...state,
  list: [...state.list, card],
  isDirty: true,
});

export const removeCard = (state: GameState, index: number): GameState => {
  if (index < 0 || index >= state.list.length) { return state; }
  return {
    ...state,
    list: state.list.filter((_, idx) => idx !== index),
    isDirty: true,
  };
};

/** The freshly fetched settings replace whatever was there, clean and loaded. */
export const loaded = (value: GameState): GameState => ({
  ...value,
  isDirty: false,
  isLoaded: true,
  error: null,
});

export const setError = (state: GameState, error: Error): GameState => ({ ...state, error });

export const setLoadError = (state: GameState, error: Error): GameState => ({ ...state, error, loadFailed: true });

export const clearError = (state: GameState): GameState => ({ ...state, error: null, loadFailed: false });

export const setDirty = (state: GameState): GameState => ({ ...state, isDirty: true });
