import { actions } from '../../../../../../data/redux';

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
