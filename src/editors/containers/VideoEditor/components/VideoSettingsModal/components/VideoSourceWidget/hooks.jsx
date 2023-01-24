import { actions } from '../../../../../../data/redux';

export const sourceHooks = ({ dispatch }) => ({
  updateVideoURL: (e) => dispatch(actions.video.updateField({ videoSource: e.target.value })),
  updateVideoId: (e) => dispatch(actions.video.updateField({ videoId: e.target.value })),
});

export const fallbackHooks = ({ fallbackVideos, dispatch }) => ({
  addFallbackVideo: () => dispatch(actions.video.updateField({ fallbackVideos: [...fallbackVideos, ''] })),
  deleteFallbackVideo: (videoUrl) => {
    const updatedFallbackVideos = fallbackVideos.splice(fallbackVideos.indexOf(videoUrl), 1);
    dispatch(actions.video.updateField({ fallbackVideos: updatedFallbackVideos }));
  },
});

export default {
  sourceHooks,
  fallbackHooks,
};
