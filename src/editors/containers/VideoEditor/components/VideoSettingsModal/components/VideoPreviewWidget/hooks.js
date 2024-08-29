import messages from '../messages';
import { parseYoutubeId } from '../../../../../../data/services/cms/api';

function getVideoType(videoSource) {
  if (parseYoutubeId(videoSource) !== null) {
    return messages.videoTypeYoutube;
  }
  return messages.videoTypeOther;
}

export default {
  getVideoType,
};
