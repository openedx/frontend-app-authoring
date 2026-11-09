import React from 'react';
import { useSelector } from 'react-redux';

import type { EditorComponent } from '@src/editors/EditorComponent';
import { selectors } from '@src/editors/data/redux';
import { MatchingEditorContextProvider } from './context';
import { MatchingEditorContainer } from './MatchingEditorContainer';

/**
 * Built-in editor for the Matching XBlock (xblocks-core).
 */
const MatchingEditor: React.FC<EditorComponent> = (props) => {
  // The rest of the editing infrastructure uses Redux still. We will hook into the minimum needed
  // to be compatible, and otherwise use ReactQuery and contexts.
  const blockId = useSelector(selectors.app.blockId) || '';

  return (
    <MatchingEditorContextProvider blockId={blockId}>
      <MatchingEditorContainer {...props} />
    </MatchingEditorContextProvider>
  );
};

export default MatchingEditor;
