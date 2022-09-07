import React from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import { thunkActions } from '../../../data/redux';
import VideoSettingsModal from './VideoSettingsModal';
// import SelectVideoModal from './SelectVideoModal';
import * as module from './VideoEditorModal';

export const hooks = {
  initialize: (dispatch) => {
    React.useEffect(() => {
      dispatch(thunkActions.video.loadVideoData());
    }, []);
  },
};

const VideoEditorModal = ({
  close,
  error,
  isOpen,
}) => {
  const dispatch = useDispatch();
  module.hooks.initialize(dispatch);
  return (
    <VideoSettingsModal {...{ close, error, isOpen }} />
  );
  // TODO: add logic to show SelectVideoModal if no selection
};

VideoEditorModal.defaultProps = {
  error: {
    duration: {},
    handout: {},
    license: {},
    thumbnail: {},
    transcripts: {},
    videoSource: {},
  },
};
VideoEditorModal.propTypes = {
  close: PropTypes.func.isRequired,
  error: PropTypes.node,
  isOpen: PropTypes.bool.isRequired,
};
export default VideoEditorModal;
