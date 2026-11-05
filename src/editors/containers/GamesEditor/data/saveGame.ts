import React from 'react';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';

import analyticsEvt from '@src/editors/data/constants/analyticsEvt';
import { navigateTo } from '@src/editors/hooks';
import { validateCards, type DeckValidationErrors, type ValidationErrors } from '../gameContent';
import type { BlockEditorProps, GameState } from '../types';
import type { GameActions } from './useGameState';

/**
 * Mirrors the shared save's course refresh so the outline picks up the change.
 * The shared saveBlock thunk does this itself; this editor does not go
 * through it.
 */
export const triggerCourseRefresh = () => {
  const storageKey = 'courseRefreshTriggerOnComponentEditSave';
  const now = Date.now().toString();
  try {
    // Session storage, as the shared save uses: it keeps the signal to this
    // tab, where local storage would also fire it in every other Studio tab.
    sessionStorage.setItem(storageKey, now);
    window.dispatchEvent(new StorageEvent('storage', { key: storageKey, newValue: now }));
  } catch {
    // Storage can be unavailable (private mode); the refresh is a nicety.
  }
};

/** What a save did, in the only three shapes the editor acts on. */
export type SaveOutcome =
  | { status: 'saved'; }
  | { status: 'invalid'; validationErrors: ValidationErrors; deckErrors: DeckValidationErrors; }
  | { status: 'failed'; error: unknown; };

/** What the editors' store hands analytics; see selectors.app.analytics. */
type SaveAnalytics = { blockId: string | null; blockType: string | null; learningContextId: string | null; };

interface SaveGameArgs {
  /** The parts of the game state a save reads before it starts. */
  state: Pick<GameState, 'isDirty' | 'isLoaded'>;
  actions: Pick<GameActions, 'getLatestState' | 'waitForPendingRequests' | 'save'>;
  /** The title is edited in the container's header, outside the game state. */
  isTitleDirty: boolean;
  getTitle: () => string | null;
  analytics: SaveAnalytics | null;
  returnFunction?: BlockEditorProps['returnFunction'];
  onClose: (() => void) | null;
  returnUrl: string;
  /** The editor's course-outline refresh, injected so the seam stays view-free. */
  refreshCourse: () => void;
}

/**
 * The Games editor's save seam: everything from the Save click to leaving the
 * editor, in one place. Draining uploads, the mounted guard, revalidation, the
 * payload projection and the persisted flag are internal; the title, the
 * course refresh and the three ways to leave are injected by the caller.
 *
 * Always resolves with an outcome and never throws, so the view reports an
 * invalid save inline instead of through the container's request-failure toast.
 */
export const useSaveGame = ({
  state,
  actions,
  isTitleDirty,
  getTitle,
  analytics,
  returnFunction,
  onClose,
  returnUrl,
  refreshCourse,
}: SaveGameArgs) => {
  // False once this editor has gone away (Cancel -> Discard changes, or the
  // host moving to another block). A save can still be waiting on an upload at
  // that point, and must not go on to persist what the author walked away from.
  const mountedRef = React.useRef(true);
  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  // Set the moment the block accepts a save. The container arms the
  // leave-page warning on `isDirty` until the save has resolved, but this
  // editor navigates away (a beforeunload) before that, so it has to answer
  // "nothing unsaved" itself from that point. A ref, not state: the navigation
  // happens in the same tick, before any re-render.
  const persistedRef = React.useRef(false);

  const save = React.useCallback(async (): Promise<SaveOutcome> => {
    if (!state.isLoaded) {
      return { status: 'failed', error: new Error('Game settings have not loaded yet; refusing to save.') };
    }
    // An image upload may still be in flight. Wait for it, then read the state
    // as it stands afterwards; a failure here is already recorded on the state.
    try {
      await actions.waitForPendingRequests();
    } catch (error) {
      return { status: 'failed', error };
    }
    if (!mountedRef.current) {
      return {
        status: 'failed',
        error: new Error('The editor was closed before the save went out; nothing was saved.'),
      };
    }
    const latest = actions.getLatestState();
    // Validation ran at the click, before the wait. An upload that landed since
    // can have made a card invalid (an image with no text).
    const { errors, deckErrors, isValid } = validateCards({
      decks: latest.decks,
      list: latest.list,
      type: latest.type,
      supportsDecks: latest.supportsDecks,
    });
    if (!isValid) {
      return { status: 'invalid', validationErrors: errors, deckErrors };
    }
    let response;
    try {
      response = await actions.save({ title: getTitle() });
    } catch (error) {
      return { status: 'failed', error };
    }
    persistedRef.current = true;
    refreshCourse();
    // The same save event the shared save sends (navigateCallback in
    // editors/hooks), under the same condition.
    if (process.env.NODE_ENV !== 'development' && analyticsEvt.editorSaveClick && analytics) {
      sendTrackEvent(analyticsEvt.editorSaveClick, analytics);
    }
    // The author may have closed this editor while the request was out. Its
    // close/navigate callbacks now belong to whatever the page shows next
    // (possibly another block's editor), so they must not run.
    if (!mountedRef.current) { return { status: 'saved' }; }
    // Same contract as navigateCallback in editors/hooks.
    if (returnFunction) {
      returnFunction()(response.data);
    } else if (onClose) {
      onClose();
    } else {
      // The standalone editor route supplies neither; go back to where the
      // built-in save would have (see navigateCallback in editors/hooks).
      navigateTo(returnUrl);
    }
    return { status: 'saved' };
  }, [state.isLoaded, actions, getTitle, refreshCourse, analytics, returnFunction, onClose, returnUrl]);

  // Matches what the view answered before the seam existed.
  const isDirty = React.useCallback(
    () => !persistedRef.current && (state.isDirty || isTitleDirty),
    [state.isDirty, isTitleDirty],
  );

  return { save, isDirty };
};
