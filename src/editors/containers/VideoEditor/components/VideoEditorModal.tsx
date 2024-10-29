import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as appHooks from '../../../hooks';
import { thunkActions, selectors } from '../../../data/redux';
import VideoSettingsModal from './VideoSettingsModal';

interface Props {
  isLibrary: boolean;
}

export const {
  navigateTo,
} = appHooks;

export const hooks = {
  initialize: (dispatch, selectedVideoId, selectedVideoUrl) => {
    dispatch(thunkActions.video.loadVideoData(selectedVideoId, selectedVideoUrl));
  },
  useReturnToGallery: () => {
    const learningContextId = useSelector(selectors.app.learningContextId);
    const blockId = useSelector(selectors.app.blockId);
    return () => (navigateTo(`/course/${learningContextId}/editor/course-videos/${blockId}`));
  },
};

const VideoEditorModal: React.FC<Props> = ({
  isLibrary,
}) => {
  const dispatch = useDispatch();
  const searchParams = new URLSearchParams(document.location.search);
  const selectedVideoId = searchParams.get('selectedVideoId');
  const selectedVideoUrl = searchParams.get('selectedVideoUrl');
  const onReturn = hooks.useReturnToGallery();
  hooks.initialize(dispatch, selectedVideoId, selectedVideoUrl);
  return (
    <VideoSettingsModal {...{
      onReturn,
      isLibrary,
    }}
    />
  );
  // TODO: add logic to show SelectVideoModal if no selection
};

export default VideoEditorModal;
