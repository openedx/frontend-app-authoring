import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import * as appHooks from '../../../hooks';
import { thunkActions, selectors } from '../../../data/redux';
import VideoSettingsModal from './VideoSettingsModal';
// import SelectVideoModal from './SelectVideoModal';
import * as module from './VideoEditorModal';

export const {
  navigateTo,
} = appHooks;

export const hooks = {
  initialize: (dispatch) => {
    React.useEffect(() => {
      dispatch(thunkActions.video.loadVideoData());
    }, []);
  },
  returnToGallery: () => {
    const learningContextId = useSelector(selectors.app.learningContextId);
    const blockId = useSelector(selectors.app.blockId);
    return () => (navigateTo(`/course/${learningContextId}/editor/course-videos/${blockId}`));
  },
};

const VideoEditorModal = ({
  close,
  isOpen,
}) => {
  const dispatch = useDispatch();
  module.hooks.initialize(dispatch);
  const searchParams = new URLSearchParams(document.location.search);
  const showReturn = searchParams.get('return') !== null;
  const onReturn = module.hooks.returnToGallery();
  return (
    <VideoSettingsModal {...{
      close,
      isOpen,
      showReturn,
      onReturn,
    }}
    />
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
