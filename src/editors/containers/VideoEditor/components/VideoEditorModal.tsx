import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import * as appHooks from '../../../hooks';
import { thunkActions, selectors } from '../../../data/redux';
import VideoSettingsModal from './VideoSettingsModal';
import { RequestKeys } from '../../../data/constants/requests';

interface Props {
  onReturn?: (() => void);
  isLibrary: boolean;
  onClose?: (() => void) | null;
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
  onClose,
  onReturn,
}) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const selectedVideoId = searchParams.get('selectedVideoId');
  const selectedVideoUrl = searchParams.get('selectedVideoUrl');
  const onSettingsReturn = onReturn || hooks.useReturnToGallery();
  const isLoaded = useSelector(
    (state) => selectors.requests.isFinished(state, { requestKey: RequestKeys.fetchVideos }),
  );

  useEffect(() => {
    hooks.initialize(dispatch, selectedVideoId, selectedVideoUrl);
  }, [isLoaded, dispatch, selectedVideoId, selectedVideoUrl]);

  return (
    <VideoSettingsModal {...{
      onReturn: onSettingsReturn,
      isLibrary,
      onClose,
    }}
    />
  );
  // TODO: add logic to show SelectVideoModal if no selection
};

export default VideoEditorModal;
