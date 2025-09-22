import React from 'react';
import { actions } from '../../../../../../data/redux';
import { parseYoutubeId } from '../../../../../../data/services/cms/api';
import * as requests from '../../../../../../data/redux/thunkActions/requests';

export const state = {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  showVideoIdChangeAlert: (args) => React.useState(args),
};

export const sourceHooks = ({ dispatch, previousVideoId, setAlert }) => ({
  updateVideoURL: (e, videoId) => {
    const videoUrl = e.target.value;
    dispatch(actions.video.updateField({ videoSource: videoUrl }));

    const youTubeId = parseYoutubeId(videoUrl);
    if (youTubeId) {
      dispatch(requests.checkTranscriptsForImport({
        videoId,
        youTubeId,
        onSuccess: (response) => {
          if (response.data.command === 'import') {
            dispatch(actions.video.updateField({
              allowTranscriptImport: true,
            }));
          }
        },
      }));
    }
  },
  updateVideoId: (e) => {
    const updatedVideoId = e.target.value;
    if (previousVideoId !== updatedVideoId && updatedVideoId) {
      setAlert();
    }
    dispatch(actions.video.updateField({ videoId: updatedVideoId }));
  },
});

export const fallbackHooks = ({ fallbackVideos, dispatch }) => ({
  addFallbackVideo: () => dispatch(actions.video.updateField({ fallbackVideos: [...fallbackVideos, ''] })),

  deleteFallbackVideo: (videoIndex) => {
    const updatedFallbackVideos = fallbackVideos.reduce((result, currentItem, index) => {
      if (index === videoIndex) { return result; }
      return [...result, currentItem];
    }, []);

    dispatch(actions.video.updateField({ fallbackVideos: updatedFallbackVideos }));
  },
});

export const videoIdChangeAlert = () => {
  const [showVideoIdChangeAlert, setShowVideoIdChangeAlert] = state.showVideoIdChangeAlert(false);
  return {
    videoIdChangeAlert: {
      show: showVideoIdChangeAlert,
      set: () => setShowVideoIdChangeAlert(true),
      dismiss: () => setShowVideoIdChangeAlert(false),
    },
  };
};

export default {
  videoIdChangeAlert,
  sourceHooks,
  fallbackHooks,
};
