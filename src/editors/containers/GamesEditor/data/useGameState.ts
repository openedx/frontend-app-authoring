import React from 'react';

import type {
  BlockRef,
  Card,
  GameType,
  ImageType,
  RequestError,
  RequestErrorCode,
  SaveArgs,
} from '@src/editors/containers/GamesEditor/types';
import { getContent } from '../gameContent';
import { useGameSettings, useSaveGameSettings, useUploadGameImage } from './apiHooks';
import { createStore } from './gameStore';
import * as t from './gameTransitions';

export { emptyCard, initialState } from './gameTransitions';

/** What a tracked image request resolves to: nothing, or the error it hit. */
type Settled = { error: Error; } | void;

/**
 * An error a handler reported with `success: false`. Carries the server's
 * detail as `message` (empty when there was none) and the request as `code`,
 * so the editor can head it with a translated message.
 */
const requestError = (code: RequestErrorCode, detail?: string): RequestError =>
  Object.assign(new Error(detail || ''), { code });

/**
 * All editor state for one block: the settings, the card list, in-flight image
 * requests and the last error. The state lives in a small store outside
 * React (see gameStore) so that code resuming after an `await`, such as the
 * save waiting on an upload, reads it current; React subscribes to it through
 * `useSyncExternalStore`. Changes are the pure functions in gameTransitions.
 * React Query owns the requests. No Redux: this app is moving off it.
 */
export const useGameState = (block: BlockRef | null) => {
  const [store] = React.useState(() => createStore(t.initialState));
  const state = React.useSyncExternalStore(store.subscribe, store.get);
  // Image requests still in flight. Save waits for these to settle.
  const pendingRef = React.useRef(new Set<Promise<Settled>>());
  // Latest image change per card side, keyed `${cardId}:${imageType}`. A
  // response is applied only if its request is still the latest one, so a slow
  // upload cannot replace a newer selection or undo a removal.
  const imageChangeRef = React.useRef(new Map<string, object>());
  const settingsQuery = useGameSettings(block);
  const { mutateAsync: saveSettings } = useSaveGameSettings(block);
  const { mutateAsync: uploadImage } = useUploadGameImage(block);
  // Seed the form from each successful fetch: the first load, and a Retry.
  // Keyed on `dataUpdatedAt` so it runs once per fetch, not once per render.
  const { data: loadedSettings, dataUpdatedAt } = settingsQuery;
  React.useEffect(() => {
    if (!loadedSettings) { return; }
    // Every deck the block returned, or one Deck 1 built from its `cards`
    // when the backend predates decks. Every deck starts editable.
    store.set(t.stateFromSettings(loadedSettings));
  }, [dataUpdatedAt]);

  // A failed fetch, first or retried. Keyed on `errorUpdatedAt` so a second
  // failure with an equal message is still reported.
  const { error: loadError, errorUpdatedAt, refetch: refetchSettings } = settingsQuery;
  React.useEffect(() => {
    if (loadError) { store.update((s) => t.setLoadError(s, loadError)); }
  }, [errorUpdatedAt]);

  const actions = React.useMemo(() => {
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
      store.update((s) => t.setError(s, error));
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
    // Clears one side's image fields: the picture, its storage key and its alt.
    const clearImage = (cardId: string, imageType: ImageType) => {
      store.update((s) => t.updateCardField(s, { cardId }, `${imageType}_image`, ''));
      store.update((s) => t.updateCardField(s, { cardId }, `${imageType}_image_path`, ''));
      store.update((s) => t.updateCardField(s, { cardId }, `${imageType}_image_alt`, ''));
    };
    return {
      getLatestState: store.get,
      waitForPendingRequests,
      setShuffleStatus: (value: boolean) => store.update((s) => t.updateSetting(s, 'shuffle', value)),
      setTimerStatus: (value: boolean) => store.update((s) => t.updateSetting(s, 'timer', value)),
      updateType: (value: GameType) => store.update((s) => t.updateType(s, value)),
      // Every card action takes a position in the active deck or the card's
      // own id, so several deck bodies can render and edit at once without
      // selecting a deck as a render side effect.
      updateTerm: (value: t.CardTarget & { term: string; }) =>
        store.update((s) => t.updateCardField(s, value, 'term', value.term)),
      updateDefinition: (value: t.CardTarget & { definition: string; }) =>
        store.update((s) => t.updateCardField(s, value, 'definition', value.definition)),
      updateTermImageAlt: (value: t.CardTarget & { termImageAlt: string; }) =>
        store.update((s) => t.updateCardField(s, value, 'term_image_alt', value.termImageAlt)),
      updateDefinitionImageAlt: (value: t.CardTarget & { definitionImageAlt: string; }) =>
        store.update((s) => t.updateCardField(s, value, 'definition_image_alt', value.definitionImageAlt)),
      toggleOpen: (value: t.CardTarget & { isOpen: boolean; }) =>
        store.update((s) => t.setCardOpen(s, value, !!value.isOpen)),
      setList: (value: Card[] | { deckId: string; cards: Card[]; }) =>
        store.update((s) => (Array.isArray(value) ? t.setList(s, value) : t.setList(s, value.cards, value.deckId))),
      addCard: (deckId?: string) => store.update((s) => t.addCard(s, undefined, deckId)),
      removeCard: (target: t.CardTarget) => store.update((s) => t.removeCard(s, target)),
      selectDeck: (deckId: string) => store.update((s) => t.selectDeck(s, deckId)),
      addDeck: (name?: string) => store.update((s) => t.addDeck(s, name)),
      renameDeck: ({ deckId, name }: { deckId: string; name: string; }) =>
        store.update((s) => t.renameDeck(s, deckId, name)),
      deleteDeck: ({ deckId }: { deckId: string; }) => store.update((s) => t.deleteDeck(s, deckId)),
      // A deck drag reports where the deck lands; the transition owns clamping
      // and the no-op that must not dirty the state.
      moveDeck: ({ deckId, toIndex }: { deckId: string; toIndex: number; }) =>
        store.update((s) => t.moveDeck(s, deckId, toIndex)),
      // A drag reports the card, its target deck and the position in it; the
      // transition owns clamping, the blank-draft rule and the no-op.
      moveCard: ({ cardId, toDeckId, toIndex }: { cardId: string; toDeckId: string; toIndex: number; }) =>
        store.update((s) => t.moveCard(s, cardId, { deckId: toDeckId, index: toIndex })),
      uploadGameImage: (
        { cardId, imageFile, imageType }: { cardId: string; imageFile: File; imageType: ImageType; },
      ) => {
        // An upload is a change the moment it starts, not once it lands:
        // closing the editor meanwhile must ask, or the image is lost.
        store.update(t.setDirty);
        const isLatest = claimImageChange(cardId, imageType);
        return track(
          uploadImage(imageFile)
            .then(({ data }) => {
              if (!isLatest()) { return; }
              if (!data || data.success === false) {
                throw requestError('uploadFailed', data?.error);
              }
              store.update((s) => t.updateCardField(s, { cardId }, `${imageType}_image`, data.url));
              store.update((s) => t.updateCardField(s, { cardId }, `${imageType}_image_path`, data.file_path || ''));
              // The old alt text described the old picture.
              store.update((s) => t.updateCardField(s, { cardId }, `${imageType}_image_alt`, ''));
            })
            // A superseded upload's failure no longer concerns the author.
            .catch((error) => (isLatest() ? fail(error) : undefined)),
        );
      },

      // Saves through the block's own save_settings handler, so the payload is
      // built here (see buildSavePayload) and keeps the *_image_path storage
      // keys the shared saveBlock payload builder drops.
      // The handler reports failure as HTTP 200 with `success: false`, so a
      // resolved request is not yet a successful save.
      save: ({ title }: { title: string | null; }) => {
        // The payload comes from the state, so a caller holding older cards or
        // decks cannot overwrite what the editor shows: the caller supplies
        // only the title, which lives in the editors' store rather than this
        // one. `cards` is the primary deck; `decks` goes only to a backend
        // that declared the field.
        const latest = store.get();
        const { cards, decks } = getContent(latest);
        const args: SaveArgs = {
          gameType: latest.type,
          isShuffled: latest.settings.shuffle,
          hasTimer: latest.settings.timer,
          title,
          cards,
        };
        if (latest.supportsDecks) { args.decks = decks; }
        return saveSettings(args)
          .then((response) => {
            if (response.data?.success === false) {
              throw requestError('saveFailed', response.data.error);
            }
            return response;
          })
          // Whichever way it failed - the block's success:false body or a
          // request that never landed (offline, session lost, 5xx) - the editor
          // shows it, and the caller still sees the rejection.
          .catch((error: RequestError) => {
            const failure = error.code === 'saveFailed' ? error : requestError('saveFailed', error.message);
            store.update((s) => t.setError(s, failure));
            throw failure;
          });
      },

      reload: () => {
        store.update(t.clearError);
        void refetchSettings();
      },
      clearError: () => store.update(t.clearError),

      deleteGameImage: ({ cardId, imageType }: { cardId: string; imageType: ImageType; }) => {
        // Only the card changes; the stored file is never deleted from here.
        // It is shared by every version of the block, so the draft dropping it
        // says nothing about the published version learners see (nor about a
        // "Discard changes" that keeps the saved card). Whether a file is
        // unreferenced is something only the backend can know.
        claimImageChange(cardId, imageType);
        clearImage(cardId, imageType);
      },
    };
  }, [store, block, saveSettings, uploadImage, refetchSettings]);

  return { state, actions };
};

/** The editor's action set, as `useGameState` builds it. */
export type GameActions = ReturnType<typeof useGameState>['actions'];
