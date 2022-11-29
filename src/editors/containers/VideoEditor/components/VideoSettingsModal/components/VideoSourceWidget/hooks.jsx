import { actions } from '../../../../../../data/redux';
import { isEdxVideo } from '../../../../../../data/services/cms/api';

/**
 * updateVideoType({ dispatch })({e, source})
 * updateVideoType takes the current onBlur event, the current object of the video
 * source, and dispatch  method, and updates the redux value for all the fields to
 * their default values except videoId, fallbackVideos, videoType, and handouts.
 * @param {event} e - object for onBlur event
 * @param {func} dispatch - redux dispatch method
 * @param {object} source - object for the Video Source field functions and values
 */
export const updateVideoType = ({ dispatch }) => ({ e, source }) => {
  source.onBlur(e);
  let videoType;
  let videoId;
  if (isEdxVideo(source.local)) {
    videoType = 'edxVideo';
    videoId = source.local;
  } else if (source.local.includes('youtu.be')) {
    videoType = 'youtube';
    videoId = '';
  } else {
    videoType = 'html5source';
    videoId = '';
  }
  dispatch(actions.video.updateField({
    videoId,
    videoType,
    allowVideoDownloads: false,
    thumbnail: null,
    transcripts: [],
    allowTranscriptDownloads: false,
    showTranscriptByDefault: false,
    duration: {
      startTime: '00:00:00',
      stopTime: '00:00:00',
      total: '00:00:00',
    },
    licenseType: null,
  }));
};

/**
 * deleteFallbackVideo({ fallbackVideos, dispatch })(videoUrl)
 * deleteFallbackVideo takes the current array of fallback videos, string of
 * deleted video URL and dispatch  method, and updates the redux value for
 * fallbackVideos.
 * @param {array} fallbackVideos - array of current fallback videos
 * @param {func} dispatch - redux dispatch method
 * @param {string} videoUrl - string of the video URL for the fallabck video that needs to be deleted
 */
export const deleteFallbackVideo = ({ fallbackVideos, dispatch }) => (videoUrl) => {
  const updatedFallbackVideos = [];
  let firstOccurence = true;
  fallbackVideos.forEach(item => {
    if (item === videoUrl && firstOccurence) {
      firstOccurence = false;
    } else {
      updatedFallbackVideos.push(item);
    }
  });
  dispatch(actions.video.updateField({ fallbackVideos: updatedFallbackVideos }));
};

export default { deleteFallbackVideo };
