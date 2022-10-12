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
  isOpen,
}) => {
  const dispatch = useDispatch();
  module.hooks.initialize(dispatch);
  return (
    <VideoSettingsModal {...{ close, isOpen }} />
  );
  // TODO: add logic to show SelectVideoModal if no selection
};

VideoEditorModal.defaultProps = {
};
VideoEditorModal.propTypes = {
  close: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
};
export default VideoEditorModal;
