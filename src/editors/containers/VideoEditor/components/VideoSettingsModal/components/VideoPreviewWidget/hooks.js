import messages from '../messages';

// https://stackoverflow.com/a/28735961/479084
const youtubeRegex = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
function isYoutubeUrl(url) {
  return url.match(youtubeRegex) !== null;
}

function getVideoType(videoSource) {
  if (isYoutubeUrl(videoSource)) {
    return messages.videoTypeYoutube;
  }
  return messages.videoTypeOther;
}

export default {
  getVideoType,
};
