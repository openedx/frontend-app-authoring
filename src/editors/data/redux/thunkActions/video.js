import { singleVideoData } from '../../services/cms/mockVideoData';
import { actions } from '..';

export const loadVideoData = () => (dispatch) => {
  dispatch(actions.video.load(singleVideoData));
};

export const saveVideoData = () => () => {
  // dispatch(actions.app.setBlockContent)
  // dispatch(requests.saveBlock({ });
};

export default {
  loadVideoData,
  saveVideoData,
};
