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
  /**
   * Deletes the first occurrence of the given videoUrl from the fallbackVideos list
   * @param {string} videoUrl - the video URL to delete
   */
  deleteFallbackVideo: (videoUrl) => {
    const index = fallbackVideos.findIndex(video => video === videoUrl);
    const updatedFallbackVideos = [
      ...fallbackVideos.slice(0, index),
      ...fallbackVideos.slice(index + 1),
    ];
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
