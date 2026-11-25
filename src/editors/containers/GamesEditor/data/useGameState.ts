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
    const data = loadedSettings;
    const cards = (data.cards || []).map((card) => ({
      ...t.emptyCard(),
      card_key: card.card_key,
      term: card.term || '',
      // Image URLs are kept as the block returns them (relative to its
      // Studio); the view resolves them for display. See imageDisplayUrl.
      term_image: card.term_image || '',
      term_image_path: card.term_image_path || '',
      term_image_alt: card.term_image_alt || '',
      definition: card.definition || '',
      definition_image: card.definition_image || '',
      definition_image_path: card.definition_image_path || '',
      definition_image_alt: card.definition_image_alt || '',
    }));
    store.set(t.loaded({
      ...t.initialState,
      type: data.game_type || 'flashcards',
      settings: {
        shuffle: data.is_shuffled !== undefined ? data.is_shuffled : true,
        timer: data.has_timer !== undefined ? data.has_timer : true,
      },
      list: cards.length ? cards : [t.emptyCard()],
    }));
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
      updateTerm: ({ index, term }: { index: number; term: string; }) =>
        store.update((s) => t.updateCardField(s, { index }, 'term', term)),
      updateDefinition: ({ index, definition }: { index: number; definition: string; }) =>
        store.update((s) => t.updateCardField(s, { index }, 'definition', definition)),
      updateTermImageAlt: ({ index, termImageAlt }: { index: number; termImageAlt: string; }) =>
        store.update((s) => t.updateCardField(s, { index }, 'term_image_alt', termImageAlt)),
      updateDefinitionImageAlt: ({ index, definitionImageAlt }: { index: number; definitionImageAlt: string; }) =>
        store.update((s) => t.updateCardField(s, { index }, 'definition_image_alt', definitionImageAlt)),
      toggleOpen: ({ index, isOpen }: { index: number; isOpen: boolean; }) =>
        store.update((s) => t.setCardOpen(s, index, !!isOpen)),
      setList: (value: Card[]) => store.update((s) => t.setList(s, value)),
      addCard: () => store.update((s) => t.addCard(s)),
      removeCard: ({ index }: { index: number; }) => store.update((s) => t.removeCard(s, index)),

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
      save: (content: SaveArgs) =>
        saveSettings(content).then((response) => {
          if (response.data?.success === false) {
            const error = requestError('saveFailed', response.data.error);
            store.update((s) => t.setError(s, error));
            throw error;
          }
          return response;
        }),

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
