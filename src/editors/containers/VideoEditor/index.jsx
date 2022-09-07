import React from 'react';
import PropTypes from 'prop-types';

import EditorContainer from '../EditorContainer';
import VideoEditorModal from './components/VideoEditorModal';
import * as hooks from './hooks';

export default function VideoEditor({
  onClose,
}) {
  const {
    error,
    validateEntry,
  } = hooks.errorsHook();

  return (
    <EditorContainer
      getContent={() => ({})}
      onClose={onClose}
      validateEntry={validateEntry}
    >
      <div className="video-editor">
        <VideoEditorModal {...{ error }} />
      </div>
    </EditorContainer>
  );
}

VideoEditor.defaultProps = {
  onClose: null,
};
VideoEditor.propTypes = {
  onClose: PropTypes.func,
};
