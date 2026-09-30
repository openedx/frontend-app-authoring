// Note: there is no Editor.test.tsx. This component only works together with
// <EditorPage> as its parent, so they are tested together in EditorPage.test.tsx
import React from 'react';
import { useDispatch } from 'react-redux';

import XBlockEditorSlot from '@src/plugin-slots/XBlockEditorSlot';

import * as hooks from './hooks';

import supportedEditors from './supportedEditors';
import type { EditorComponent } from './EditorComponent';
import AdvancedEditor from './AdvancedEditor';

export interface Props extends EditorComponent {
  blockType: string;
  blockId: string | null;
  learningContextId: string | null;
  lmsEndpointUrl: string | null;
  studioEndpointUrl: string | null;
}

const Editor: React.FC<Props> = ({
  learningContextId,
  blockType,
  blockId,
  lmsEndpointUrl,
  studioEndpointUrl,
  onClose = null,
  returnFunction = null,
  extraProps,
}) => {
  const dispatch = useDispatch();
  const loading = hooks.useInitializeApp({
    dispatch,
    data: {
      blockId,
      blockType,
      learningContextId,
      lmsEndpointUrl,
      studioEndpointUrl,
    },
  });

  const EditorComponent = supportedEditors[blockType];

  // Do not load editor until everything is initialized.
  if (loading) {
    return null;
  }

  // Unchanged behaviour, now the slot's default content: a built-in editor when
  // this app has one for the block type, otherwise the generic AdvancedEditor.
  const defaultEditor = EditorComponent === undefined
    ? (blockId && <AdvancedEditor usageKey={blockId} onClose={onClose} />)
    : <EditorComponent {...{ onClose, returnFunction, extraProps }} />;

  return (
    <XBlockEditorSlot
      blockType={blockType}
      blockId={blockId}
      learningContextId={learningContextId}
      lmsEndpointUrl={lmsEndpointUrl}
      studioEndpointUrl={studioEndpointUrl}
      onClose={onClose}
      returnFunction={returnFunction}
      extraProps={extraProps}
    >
      {defaultEditor}
    </XBlockEditorSlot>
  );
};

export default Editor;
