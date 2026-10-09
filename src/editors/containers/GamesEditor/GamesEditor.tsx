import React from 'react';
import { useSelector, useStore } from 'react-redux';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';

import './GamesEditor.scss';
import analyticsEvt from '@src/editors/data/constants/analyticsEvt';
import { type EditorState, selectors } from '@src/editors/data/redux';
import { useEditorContext } from '@src/editors/EditorContext';
import * as editorHooks from '@src/editors/hooks';
import { isLibraryKey } from '@src/generic/key-utils';
import GameEditor from './components/GameEditor';
import { useGameState } from './data/useGameState';
import { getContent, validateCards } from './gameContent';
import type { BlockEditorProps } from './types';

/**
 * Mirrors the shared save's course refresh so the outline picks up the change.
 * The shared saveBlock thunk does this itself; this editor does not go
 * through it.
 */
const triggerCourseRefresh = () => {
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

export const GamesEditorForBlock = ({
  blockId,
  studioEndpointUrl,
  onClose,
  returnFunction = null,
}: BlockEditorProps) => {
  const { learningContextId } = useEditorContext();
  // Everything the API layer needs to reach this block. `isLibrary` says
  // whether the block's handler URLs are issued by the server (v2 libraries)
  // rather than fixed, which is decided by the learning context. Legacy (v1)
  // libraries are deliberately not included: their blocks have legacy usage
  // keys, which the v2 resolver rejects, and they use the fixed route.
  const block = React.useMemo(() => (blockId
    ? { blockId, studioEndpointUrl, isLibrary: isLibraryKey(learningContextId) }
    : null), [blockId, studioEndpointUrl, learningContextId]);
  const { state, actions } = useGameState(block);
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
  // The title lives in the editors' store, which EditorContainer's title
  // header writes to; read it from the same place the shared save does.
  const blockTitle = useSelector(selectors.app.blockTitle);
  // The save reads the title from the store when it goes out, not from the
  // last render: the title header commits a pending edit on blur, which
  // EditorContainer triggers as Save starts, so the newest title may not have
  // re-rendered yet. EditorContainer locks the header for the rest of the save.
  const store = useStore<EditorState>();
  const returnUrl = useSelector(selectors.app.returnUrl);
  const analytics = useSelector(selectors.app.analytics);
  // The title is saved by this editor but edited in EditorContainer's header, so the
  // game state never sees it change. Compare against the block as loaded.
  const blockValue = useSelector(selectors.app.blockValue);
  const isTitleDirty = !!blockValue && (blockTitle ?? '') !== (blockValue.data?.display_name ?? '');
  // Set the moment the block accepts a save. The container arms the
  // leave-page warning on `isDirty` until the save has resolved, but this
  // editor navigates away (a beforeunload) before that, so it has to answer
  // "nothing unsaved" itself from that point. A ref, not state: the navigation
  // happens in the same tick, before any re-render.
  const persistedRef = React.useRef(false);
  const isDirty = React.useCallback(
    () => !persistedRef.current && (state.isDirty || isTitleDirty),
    [state.isDirty, isTitleDirty],
  );

  const handleSave = React.useCallback(() => {
    if (!state.isLoaded) {
      return Promise.reject(new Error('Game settings have not loaded yet; refusing to save.'));
    }
    // An image upload may still be in flight. Wait for it, then
    // read the state as it stands afterwards; otherwise the card is written
    // without the image change and the editor closes on top of it.
    return actions.waitForPendingRequests()
      .then(() => {
        if (!mountedRef.current) {
          throw new Error('The editor was closed before the save went out; nothing was saved.');
        }
        const latest = actions.getLatestState();
        // Validation ran at the click, before the wait. An upload that landed
        // since can have made a card invalid (an image with no text).
        const { errors, isValid } = validateCards(latest);
        if (!isValid) {
          throw Object.assign(new Error('Game cards failed validation.'), { validationErrors: errors });
        }
        const content = getContent({
          type: latest.type,
          settings: latest.settings,
          list: latest.list,
        });
        return actions.save({
          gameType: content.gameType,
          isShuffled: content.isShuffled,
          hasTimer: content.hasTimer,
          cards: content.cards,
          title: selectors.app.blockTitle(store.getState()),
        });
      })
      .then((response) => {
        persistedRef.current = true;
        // The save did land, so the outline still needs to pick it up.
        triggerCourseRefresh();
        // The same save event the shared save sends (navigateCallback in
        // editors/hooks), under the same condition.
        if (process.env.NODE_ENV !== 'development') {
          sendTrackEvent(analyticsEvt.editorSaveClick, analytics);
        }
        // The author may have closed this editor while the request was out. Its
        // close/navigate callbacks now belong to whatever the page shows next
        // (possibly another block's editor), so they must not run.
        if (!mountedRef.current) { return response; }
        // Same contract as navigateCallback in editors/hooks.
        if (returnFunction) {
          returnFunction()(response.data);
        } else if (onClose) {
          onClose();
        } else {
          // The standalone editor route supplies neither; go back to where the
          // built-in save would have (see navigateCallback in editors/hooks).
          editorHooks.navigateTo(returnUrl);
        }
        return response;
      });
  }, [actions, state.isLoaded, returnFunction, onClose, returnUrl, analytics]);

  return (
    <GameEditor
      onClose={onClose}
      onSave={handleSave}
      returnFunction={returnFunction}
      // The load is owned by useGameState, so the editor is "finished" as soon
      // as that first fetch resolves.
      blockFinished={state.isLoaded}
      studioEndpointUrl={studioEndpointUrl}
      settings={state.settings}
      type={state.type}
      list={state.list}
      isDirty={isDirty}
      error={state.error}
      loadFailed={state.loadFailed}
      {...actions}
    />
  );
};
