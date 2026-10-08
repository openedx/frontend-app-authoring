import React from 'react';
import { useSelector } from 'react-redux';
import { getConfig } from '@edx/frontend-platform';

import type { EditorComponent } from '@src/editors/EditorComponent';
import { selectors } from '@src/editors/data/redux';
import { GamesEditorForBlock } from './GamesEditor';

/**
 * Built-in editor for the `games` XBlock (edx-games).
 *
 * As PdfEditor does, it takes the block's identity from the editors' Redux
 * store, which Editor.tsx initialises, and keeps everything else (settings,
 * cards, uploads, errors) in its own React Query and reducer state.
 */
const GamesEditor: React.FC<EditorComponent> = ({ onClose = null, returnFunction = null }) => {
  const blockId = useSelector(selectors.app.blockId);
  // The standalone editor route initialises the store without an endpoint.
  const studioEndpointUrl = useSelector(selectors.app.studioEndpointUrl) ?? getConfig().STUDIO_BASE_URL;

  // One editor instance per block and per Studio. Keying remounts everything
  // when the page moves to another block without unmounting, so the previous
  // block's cards, pending uploads and waiting saves cannot leak into the new
  // one (its cards would otherwise stay "loaded", and saveable, until the new
  // fetch resolved). The same id on a different Studio is different content.
  return (
    <GamesEditorForBlock
      key={`${blockId}|${studioEndpointUrl}`}
      blockId={blockId}
      studioEndpointUrl={studioEndpointUrl}
      onClose={onClose}
      returnFunction={returnFunction}
    />
  );
};

export default GamesEditor;
