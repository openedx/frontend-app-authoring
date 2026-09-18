import React from 'react';

import type {
  BlockRef,
  Card,
  GameActions,
  GameSettings,
  GameState,
  GameType,
  ImageType,
  RequestError,
  RequestErrorCode,
} from '../types';
import { useGameSettings, useSaveGameSettings, useUploadGameImage } from './apiHooks';

const generateId = () => `card-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

export const emptyCard = (): Card => ({
  id: generateId(),
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

/**
 * Replaces the host app's `game` Redux slice.
 *
 * The reducer cases are a direct translation of that slice, so behaviour is
 * unchanged; only the plumbing is local. Keeping state inside the plugin is
 * what lets it ship without the host app knowing it exists.
 */
/** What a tracked image request resolves to: nothing, or the error it hit. */
type Settled = { error: Error; } | void;

type CardField = Exclude<keyof Card, 'id'>;

type Action =
  | { type: 'updateSetting'; key: keyof GameSettings; value: boolean; }
  | { type: 'updateType'; value: GameType; }
  | { type: 'updateCardField'; field: CardField; value: string | boolean; index?: number; cardId?: string; }
  | { type: 'setCardOpen'; index: number; isOpen: boolean; }
  | { type: 'setList'; value: Card[]; }
  | { type: 'addCard'; card: Card; }
  | { type: 'removeCard'; index: number; }
  | { type: 'loaded'; value: GameState; }
  | { type: 'setError' | 'setLoadError'; value: Error; }
  | { type: 'clearError' | 'setDirty' | 'setClean'; };

export const reducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'updateSetting':
      return {
        ...state,
        settings: { ...state.settings, [action.key]: action.value },
        isDirty: true,
      };
    case 'updateType':
      return { ...state, type: action.value, isDirty: true };
    case 'updateCardField': {
      // Async work (image upload) targets a card by id, because the
      // card's position may have changed by the time the request settles.
      const index = action.cardId != null
        ? state.list.findIndex((card) => card.id === action.cardId)
        : action.index ?? -1;
      if (index < 0 || !state.list[index]) { return state; }
      return {
        ...state,
        list: state.list.map((card, idx) => (
          idx === index ? { ...card, [action.field]: action.value } : card
        )),
        isDirty: true,
      };
    }
    // UI only: whether a card is expanded. Not saved, so not a change to the game.
    case 'setCardOpen': {
      if (!state.list[action.index]) { return state; }
      return {
        ...state,
        list: state.list.map((card, idx) => (idx === action.index ? { ...card, editorOpen: action.isOpen } : card)),
      };
    }
    case 'setList':
      return { ...state, list: action.value, isDirty: true };
    // The card arrives in the action: the reducer runs twice per action (see
    // `dispatch` below), so an id generated here would differ between the two.
    case 'addCard':
      return { ...state, list: [...state.list, action.card], isDirty: true };
    case 'removeCard': {
      if (action.index < 0 || action.index >= state.list.length) { return state; }
      return {
        ...state,
        list: state.list.filter((_, idx) => idx !== action.index),
        isDirty: true,
      };
    }
    case 'loaded':
      return {
        ...action.value,
        isDirty: false,
        isLoaded: true,
        error: null,
      };
    case 'setError':
      return { ...state, error: action.value };
    case 'setLoadError':
      return { ...state, error: action.value, loadFailed: true };
    case 'clearError':
      return { ...state, error: null, loadFailed: false };
    case 'setDirty':
      return { ...state, isDirty: true };
    case 'setClean':
      return { ...state, isDirty: false };
    default:
      return state;
  }
};

/**
 * An error a handler reported with `success: false`. Carries the server's
 * detail as `message` (empty when there was none) and the request as `code`,
 * so the editor can head it with a translated message.
 */
const requestError = (code: RequestErrorCode, detail?: string): RequestError =>
  Object.assign(new Error(detail || ''), { code });

/** Absolute-ise a handler-relative media URL against the block's Studio. */
const absolute = <T extends string | undefined>(url: T, studioEndpointUrl: string): T | string => {
  if (!url || url.startsWith('http')) { return url; }
  return `${studioEndpointUrl}${url}`;
};

export const useGameState = (block: BlockRef | null): { state: GameState; actions: GameActions; } => {
  const [state, rawDispatch] = React.useReducer(reducer, initialState);
  // Mirror of the reducer state, advanced synchronously on every dispatch.
  // React applies the same actions later and lands on the same value (the
  // reducer is pure), but code that runs right after an async step, before
  // the re-render, needs the up-to-date value now. `getLatestState` reads it.
  const stateRef = React.useRef<GameState>(initialState);
  const dispatch = React.useCallback((action: Action) => {
    stateRef.current = reducer(stateRef.current, action);
    rawDispatch(action);
  }, []);
  // Image requests still in flight. Save waits for these to settle.
  const pendingRef = React.useRef(new Set<Promise<Settled>>());
  // Latest image change per card side, keyed `${cardId}:${imageType}`. A
  // response is applied only if its request is still the latest one, so a slow
  // upload cannot replace a newer selection or undo a removal.
  const imageChangeRef = React.useRef(new Map<string, object>());
  const settingsQuery = useGameSettings(block);
  const { mutateAsync: saveSettings } = useSaveGameSettings(block);
  const { mutateAsync: uploadImage } = useUploadGameImage(block);
  // The query only runs with a block, so the seed effect below always has one.
  const studioEndpointUrl = block?.studioEndpointUrl ?? '';

  // Seed the form from each successful fetch: the first load, and a Retry.
  // Keyed on `dataUpdatedAt` so it runs once per fetch, not once per render.
  const { data: loadedSettings, dataUpdatedAt } = settingsQuery;
  React.useEffect(() => {
    if (!loadedSettings) { return; }
    const data = loadedSettings;
    const cards = (data.cards || []).map((card, index) => ({
      ...emptyCard(),
      id: `card-${Date.now()}-${index}`,
      card_key: card.card_key,
      term: card.term || '',
      term_image: absolute(card.term_image, studioEndpointUrl) || '',
      term_image_path: card.term_image_path || '',
      term_image_alt: card.term_image_alt || '',
      definition: card.definition || '',
      definition_image: absolute(card.definition_image, studioEndpointUrl) || '',
      definition_image_path: card.definition_image_path || '',
      definition_image_alt: card.definition_image_alt || '',
    }));
    dispatch({
      type: 'loaded',
      value: {
        ...initialState,
        type: data.game_type || 'flashcards',
        settings: {
          shuffle: data.is_shuffled !== undefined ? data.is_shuffled : true,
          timer: data.has_timer !== undefined ? data.has_timer : true,
        },
        list: cards.length ? cards : [emptyCard()],
      },
    });
  }, [dataUpdatedAt]);

  // A failed fetch, first or retried. Keyed on `errorUpdatedAt` so a second
  // failure with an equal message is still reported.
  const { error: loadError, errorUpdatedAt, refetch: refetchSettings } = settingsQuery;
  React.useEffect(() => {
    if (loadError) { dispatch({ type: 'setLoadError', value: loadError }); }
  }, [errorUpdatedAt]);

  const actions = React.useMemo((): GameActions => {
    const track = (promise: Promise<Settled>): Promise<Settled> => {
      pendingRef.current.add(promise);
      const untrack = () => pendingRef.current.delete(promise);
      promise.then(untrack, untrack);
      return promise;
    };
    // Marks a new image change as the latest for that card side and returns a
    // check for whether it still is.
    const claimImageChange = (cardId: string, imageType: ImageType) => {
      const key = `${cardId}:${imageType}`;
      const token = {};
      imageChangeRef.current.set(key, token);
      return () => imageChangeRef.current.get(key) === token;
    };
    // Reports a failed image request to the editor. The tracked promise still
    // resolves (callers fire and forget, so a rejection would go unhandled),
    // but with the error, so `waitForPendingRequests` can see it.
    const fail = (error: Error) => {
      dispatch({ type: 'setError', value: error });
      return { error };
    };
    // Resolves once every in-flight image request has settled, looping in
    // case another one started meanwhile. Rejects if any of them failed, so a
    // save waiting on them does not go ahead with the old image state.
    const waitForPendingRequests = (): Promise<void> => {
      if (pendingRef.current.size === 0) { return Promise.resolve(); }
      return Promise.all(Array.from(pendingRef.current)).then((results) => {
        const failed = results.find((result) => result && result.error);
        if (failed) { throw failed.error; }
        return waitForPendingRequests();
      });
    };
    return {
      getLatestState: () => stateRef.current,
      waitForPendingRequests,
      setShuffleStatus: (value) => dispatch({ type: 'updateSetting', key: 'shuffle', value }),
      setTimerStatus: (value) => dispatch({ type: 'updateSetting', key: 'timer', value }),
      updateType: (value) => dispatch({ type: 'updateType', value }),
      updateTerm: ({ index, term }) =>
        dispatch({
          type: 'updateCardField',
          index,
          field: 'term',
          value: term,
        }),
      updateDefinition: ({ index, definition }) =>
        dispatch({
          type: 'updateCardField',
          index,
          field: 'definition',
          value: definition,
        }),
      updateTermImageAlt: ({ index, termImageAlt }) =>
        dispatch({
          type: 'updateCardField',
          index,
          field: 'term_image_alt',
          value: termImageAlt,
        }),
      updateDefinitionImageAlt: ({ index, definitionImageAlt }) =>
        dispatch({
          type: 'updateCardField',
          index,
          field: 'definition_image_alt',
          value: definitionImageAlt,
        }),
      toggleOpen: ({ index, isOpen }) => dispatch({ type: 'setCardOpen', index, isOpen: !!isOpen }),
      setList: (value) => dispatch({ type: 'setList', value }),
      addCard: () => dispatch({ type: 'addCard', card: emptyCard() }),
      removeCard: ({ index }) => dispatch({ type: 'removeCard', index }),

      uploadGameImage: ({ cardId, imageFile, imageType }) => {
        // An upload is a change the moment it starts, not once it lands:
        // closing the editor meanwhile must ask, or the image is lost.
        dispatch({ type: 'setDirty' });
        const isLatest = claimImageChange(cardId, imageType);
        return track(
          uploadImage(imageFile)
            .then(({ data }) => {
              if (!isLatest()) { return; }
              if (!data || data.success === false) {
                throw requestError('uploadFailed', data?.error);
              }
              dispatch({
                type: 'updateCardField',
                cardId,
                field: `${imageType}_image`,
                value: absolute(data.url, studioEndpointUrl),
              });
              dispatch({
                type: 'updateCardField',
                cardId,
                field: `${imageType}_image_path`,
                value: data.file_path || '',
              });
            })
            // A superseded upload's failure no longer concerns the author.
            .catch((error) => (isLatest() ? fail(error) : undefined)),
        );
      },

      // Saves through the block's own save_settings handler, so the payload is
      // built here (see buildSavePayload) and keeps the *_image_path storage
      // keys the host app's own payload builder drops.
      // The handler reports failure as HTTP 200 with `success: false`, so a
      // resolved request is not yet a successful save.
      save: (content) =>
        saveSettings(content).then((response) => {
          if (response.data?.success === false) {
            const error = requestError('saveFailed', response.data.error);
            dispatch({ type: 'setError', value: error });
            throw error;
          }
          return response;
        }),

      reload: () => {
        dispatch({ type: 'clearError' });
        void refetchSettings();
      },
      clearError: () => dispatch({ type: 'clearError' }),

      deleteGameImage: ({ cardId, imageType }) => {
        const clear = () => {
          dispatch({
            type: 'updateCardField',
            cardId,
            field: `${imageType}_image`,
            value: '',
          });
          dispatch({
            type: 'updateCardField',
            cardId,
            field: `${imageType}_image_path`,
            value: '',
          });
          dispatch({
            type: 'updateCardField',
            cardId,
            field: `${imageType}_image_alt`,
            value: '',
          });
        };
        // Only the card changes; the stored file is never deleted from here.
        // It is shared by every version of the block, so the draft dropping it
        // says nothing about the published version learners see (nor about a
        // "Discard changes" that keeps the saved card). Whether a file is
        // unreferenced is something only the backend can know.
        claimImageChange(cardId, imageType);
        clear();
      },
    };
  }, [block, studioEndpointUrl, saveSettings, uploadImage, refetchSettings]);

  return { state, actions };
};
