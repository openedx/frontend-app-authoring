import React from 'react';
import { useDispatch } from 'react-redux';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import messages from './messages';
import * as hooks from './hooks';

import supportedEditors from './supportedEditors';
import type { EditorComponent } from './EditorComponent';

export interface Props extends EditorComponent {
  blockType: string;
  blockId?: string | null;
  learningContextId?: string | null;
  lmsEndpointUrl?: string | null;
  studioEndpointUrl?: string | null;
}

const Editor: React.FC<Props> = ({
  learningContextId = null,
  blockType,
  blockId = null,
  lmsEndpointUrl = null,
  studioEndpointUrl = null,
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

  const EditorComponent = supportedEditors[blockType];
  return (
    <div
      className="d-flex flex-column"
    >
      <div
        className="pgn__modal-fullscreen h-100"
        role="dialog"
        aria-label={blockType}
      >
        {(EditorComponent !== undefined)
          ? <EditorComponent {...{ onClose, returnFunction }} />
          : <FormattedMessage {...messages.couldNotFindEditor} />}
      </div>
    </div>
  );
};

export default Editor;
