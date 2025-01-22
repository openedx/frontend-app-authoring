// Note: there is no Editor.test.tsx. This component only works together with
// <EditorPage> as its parent, so they are tested together in EditorPage.test.tsx
import React from 'react';
import { useDispatch } from 'react-redux';

import * as hooks from './hooks';

import supportedEditors from './supportedEditors';
import type { EditorComponent } from './EditorComponent';
import { useEditorContext } from './EditorContext';
import AdvancedEditor from './AdvancedEditor';

export interface Props extends EditorComponent {
  blockType: string;
  blockId: string | null;
  learningContextId: string | null;
  lmsEndpointUrl: string | null;
  studioEndpointUrl: string | null;
  fullScreen?: boolean;
}

const Editor: React.FC<Props> = ({
  learningContextId,
  blockType,
  blockId,
  lmsEndpointUrl,
  studioEndpointUrl,
  onClose = null,
  returnFunction = null,
}) => {
  const dispatch = useDispatch();
  hooks.initializeApp({
    dispatch,
    data: {
      blockId,
      blockType,
      learningContextId,
      lmsEndpointUrl,
      studioEndpointUrl,
    },
  });
  const { fullScreen } = useEditorContext();

  const EditorComponent = supportedEditors[blockType];

  if (EditorComponent === undefined && blockId) {
    return (
      <AdvancedEditor
        usageKey={blockId}
        onClose={onClose}
      />
    );
  }

  const innerEditor = <EditorComponent {...{ onClose, returnFunction }} />;

  if (fullScreen) {
    return (
      <div
        className="d-flex flex-column"
      >
        <div
          className="pgn__modal-fullscreen h-100"
          role="dialog"
          aria-label={blockType}
        >
          {innerEditor}
        </div>
      </div>
    );
  }
  return innerEditor;
};

export default Editor;
