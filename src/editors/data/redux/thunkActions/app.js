import { StrictDict, camelizeKeys } from '../../../utils';
/* eslint-disable import/no-cycle */
import { actions } from '..';
import * as requests from './requests';
import * as module from './app';

export const fetchBlock = () => (dispatch) => {
  dispatch(requests.fetchBlock({
    onSuccess: (response) => dispatch(actions.app.setBlockValue(response)),
    // eslint-disable-next-line
    onFailure: (e) => console.log({ fetchFailure: e }),
  }));
};

export const fetchStudioView = () => (dispatch) => {
  dispatch(requests.fetchStudioView({
    onSuccess: (response) => dispatch(actions.app.setStudioView(response)),
    onFailure: (e) => dispatch(actions.app.setStudioView(e)),
  }));
};

export const fetchUnit = () => (dispatch) => {
  dispatch(requests.fetchUnit({
    onSuccess: (response) => dispatch(actions.app.setUnitUrl(response)),
    onFailure: (e) => dispatch(actions.app.setUnitUrl(e)),
  }));
};

export const fetchAssets = () => (dispatch) => {
  dispatch(requests.fetchAssets({
    onSuccess: (response) => dispatch(actions.app.setAssets(response)),
  }));
};

export const fetchVideos = () => (dispatch) => {
  dispatch(requests.fetchVideos({
    onSuccess: (response) => dispatch(actions.app.setVideos(response.data.videos)),
  }));
};

export const fetchCourseDetails = () => (dispatch) => {
  dispatch(requests.fetchCourseDetails({
    onSuccess: (response) => dispatch(actions.app.setCourseDetails(response)),
    onFailure: (e) => dispatch(actions.app.setCourseDetails(e)),
  }));
};

/**
 * @param {string} studioEndpointUrl
 * @param {string} blockId
 * @param {string} learningContextId
 * @param {string} blockType
 */
export const initialize = (data) => (dispatch) => {
  dispatch(actions.app.initialize(data));
  dispatch(module.fetchBlock());
  dispatch(module.fetchUnit());
  dispatch(module.fetchStudioView());
  dispatch(module.fetchAssets());
  dispatch(module.fetchVideos());
  dispatch(module.fetchCourseDetails());
};

/**
 * @param {func} onSuccess
 */
export const saveBlock = (content, returnToUnit) => (dispatch) => {
  dispatch(actions.app.setBlockContent(content));
  dispatch(requests.saveBlock({
    content,
    onSuccess: (response) => {
      dispatch(actions.app.setSaveResponse(response));
      returnToUnit(response.data);
    },
  }));
};

export const uploadImage = ({ file, setSelection }) => (dispatch) => {
  dispatch(requests.uploadAsset({
    asset: file,
    onSuccess: (response) => setSelection(camelizeKeys(response.data.asset)),
  }));
};

export default StrictDict({
  fetchBlock,
  fetchCourseDetails,
  fetchStudioView,
  fetchUnit,
  fetchVideos,
  initialize,
  saveBlock,
  fetchAssets,
  uploadImage,
});
