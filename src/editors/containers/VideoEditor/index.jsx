import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import EditorContainer from '../EditorContainer';
import VideoEditorModal from './components/VideoEditorModal';
import { ErrorContext, errorsHook, fetchVideoContent } from './hooks';

export const VideoEditor = ({
  onClose,
}) => {
  const {
    error,
    validateEntry,
  } = errorsHook();
  return (
    <ErrorContext.Provider value={error}>
      <EditorContainer
        getContent={fetchVideoContent()}
        onClose={onClose}
        validateEntry={validateEntry}
      >
        <div className="video-editor">
          <VideoEditorModal />
        </div>
      </EditorContainer>
    </ErrorContext.Provider>
  );
};

VideoEditor.defaultProps = {
  onClose: null,
};
VideoEditor.propTypes = {
  onClose: PropTypes.func,
};

export const mapStateToProps = () => {};

export const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(VideoEditor);
