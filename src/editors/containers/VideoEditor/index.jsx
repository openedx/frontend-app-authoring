import React from 'react';
import PropTypes from 'prop-types';

import EditorContainer from '../EditorContainer';
import VideoEditorModal from './components/VideoEditorModal';

export default function VideoEditor({
  onClose,
}) {
  return (
    <EditorContainer
      onClose={onClose}
      getContent={() => ({})}
    >
      <div className="video-editor">
        <VideoEditorModal />
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
