import React from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { blockTypes } from './data/constants/app';

import TextEditor from './containers/TextEditor';
import VideoEditor from './containers/VideoEditor';
import ProblemEditor from './containers/ProblemEditor/ProblemEditor';

import messages from './messages';
import * as hooks from './hooks';

export const supportedEditors = {
  [blockTypes.html]: TextEditor,
  [blockTypes.video]: VideoEditor,
  [blockTypes.problem]: ProblemEditor,
};

export const Editor = ({
  courseId,
  blockType,
  blockId,
  lmsEndpointUrl,
  studioEndpointUrl,
  onClose,
}) => {
  const dispatch = useDispatch();
  hooks.initializeApp({
    dispatch,
    data: {
      blockId,
      blockType,
      courseId,
      lmsEndpointUrl,
      studioEndpointUrl,
    },
  });

  const EditorComponent = supportedEditors[blockType];
  return (
    <div className="d-flex flex-column vh-100">
      <div
        className="pgn__modal-fullscreen"
        role="dialog"
        aria-label={blockType}
      >
        {(EditorComponent !== undefined)
          ? <EditorComponent onClose={onClose} />
          : <FormattedMessage {...messages.couldNotFindEditor} />}
      </div>
    </div>
  );
};
Editor.defaultProps = {
  courseId: null,
  blockId: null,
  lmsEndpointUrl: null,
  studioEndpointUrl: null,
  onClose: null,
};

Editor.propTypes = {
  courseId: PropTypes.string,
  blockType: PropTypes.string.isRequired,
  blockId: PropTypes.string,
  lmsEndpointUrl: PropTypes.string,
  onClose: PropTypes.func,
  studioEndpointUrl: PropTypes.string,
};

export default Editor;
