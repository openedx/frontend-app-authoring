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
  isOpen,
  close,
}) => {
  const dispatch = useDispatch();
  module.hooks.initialize(dispatch);
  return (
    <VideoSettingsModal {...{ isOpen, close }} />
  );
  // TODO: add logic to show SelectVideoModal if no selection
};

VideoEditorModal.defaultProps = {
};
VideoEditorModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
};
export default VideoEditorModal;
