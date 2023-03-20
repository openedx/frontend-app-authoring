import { actions } from '../../../../../../data/redux';
import { parseYoutubeId } from '../../../../../../data/services/cms/api';
import * as requests from '../../../../../../data/redux/thunkActions/requests';

export const sourceHooks = ({ dispatch }) => ({
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
