import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { selectors } from '../../data/redux';

import EditorContainer from '../EditorContainer';
import VideoEditorModal from './components/VideoEditorModal';
import { ErrorContext, errorsHook } from './hooks';

export const VideoEditor = ({
  onClose,
  // redux
  videoSettings,
}) => {
  const {
    error,
    validateEntry,
  } = errorsHook();

  return (
    <ErrorContext.Provider value={error}>
      <EditorContainer
        getContent={() => videoSettings}
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
  videoSettings: null,
};
VideoEditor.propTypes = {
  onClose: PropTypes.func,
  // redux
  videoSettings: PropTypes.shape({
    videoSource: PropTypes.string,
    fallbackVideos: PropTypes.arrayOf(PropTypes.string),
    allowVideoDownloads: PropTypes.bool,
    thumbnail: PropTypes.string,
    transcripts: PropTypes.objectOf(PropTypes.string),
    allowTranscriptDownloads: PropTypes.bool,
    duration: PropTypes.shape({
      startTime: PropTypes.number,
      stopTime: PropTypes.number,
      total: PropTypes.number,
    }),
    showTranscriptByDefult: PropTypes.bool,
    handout: PropTypes.string,
    licenseType: PropTypes.string,
    licenseDetails: PropTypes.shape({
      attribution: PropTypes.bool,
      noncommercial: PropTypes.bool,
      noDerivatives: PropTypes.bool,
      shareAlike: PropTypes.bool,
    }),
  }),
};

export const mapStateToProps = (state) => ({
  videoSettings: selectors.video.videoSettings(state),
});

export const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(VideoEditor);
