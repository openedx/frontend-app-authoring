import React from 'react';
import { useSelector } from 'react-redux';

import type { EditorComponent } from '@src/editors/EditorComponent';
import { selectors } from '@src/editors/data/redux';
import { FlashcardsEditorContextProvider } from './context';
import { FlashcardsEditorContainer } from './FlashcardsEditorContainer';

/**
 * Built-in editor for the Flashcards XBlock (xblocks-core).
 */
const FlashcardsEditor: React.FC<EditorComponent> = (props) => {
  // The rest of the editing infrastructure uses Redux still. We will hook into the minimum needed
  // to be compatible, and otherwise use ReactQuery and contexts.
  const blockId = useSelector(selectors.app.blockId) || '';

  return (
    <FlashcardsEditorContextProvider blockId={blockId}>
      <FlashcardsEditorContainer {...props} />
    </FlashcardsEditorContextProvider>
  );
};

export default FlashcardsEditor;
