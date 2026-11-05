import React from 'react';
import { useSelector, useStore } from 'react-redux';

import './GamesEditor.scss';
import { type EditorState, selectors } from '@src/editors/data/redux';
import { useEditorContext } from '@src/editors/EditorContext';
import { isLibraryKey } from '@src/generic/key-utils';
import GameEditor from './components/GameEditor';
import { triggerCourseRefresh, useSaveGame } from './data/saveGame';
import { useGameState } from './data/useGameState';
import type { BlockEditorProps } from './types';

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
  const getTitle = React.useCallback(() => selectors.app.blockTitle(store.getState()), [store]);
  const { save, isDirty } = useSaveGame({
    state,
    actions,
    isTitleDirty,
    getTitle,
    analytics,
    returnFunction,
    onClose,
    returnUrl,
    // The seam owns persist-then-leave; the course refresh stays injected.
    refreshCourse: triggerCourseRefresh,
  });

  return (
    <GameEditor
      onClose={onClose}
      onSave={save}
      returnFunction={returnFunction}
      // The load is owned by useGameState, so the editor is "finished" as soon
      // as that first fetch resolves.
      blockFinished={state.isLoaded}
      studioEndpointUrl={studioEndpointUrl}
      settings={state.settings}
      type={state.type}
      list={state.list}
      decks={state.decks}
      activeDeckId={state.activeDeckId}
      supportsDecks={state.supportsDecks}
      isDirty={isDirty}
      error={state.error}
      loadFailed={state.loadFailed}
      {...actions}
    />
  );
};
