import { StrictDict } from '../../../utils';
import { actions, selectors } from '..';
import * as requests from './requests';

export const fetchBlock = () => (dispatch) => {
  dispatch(requests.fetchBlock({
    onSuccess: (response) => dispatch(actions.app.setBlockValue(response)),
    onFailure: (e) => dispatch(actions.app.setBlockValue(e)),
  }));
};

export const fetchUnit = () => (dispatch) => {
  dispatch(requests.fetchUnit({
    onSuccess: (response) => dispatch(actions.app.setUnitUrl(response)),
    onFailure: (e) => dispatch(actions.app.setUnitUrl(e)),
  }));
};

/**
 * @param {string} studioEndpointUrl
 * @param {string} blockId
 * @param {string} courseId
 * @param {string} blockType
 */
export const initialize = (data) => (dispatch) => {
  dispatch(actions.app.initialize(data));
  dispatch(fetchBlock());
  dispatch(fetchUnit());
};

/**
 * @param {func} onSuccess
 */
export const saveBlock = ({ content, returnToUnit }) => (dispatch, getState) => {
  dispatch(actions.app.setBlockContent(content));
  dispatch(requests.saveBlock({
    content,
    onSuccess: (response) => {
      dispatch(actions.app.setSaveResponse(response));
      returnToUnit();
    },
  }));
};

export default StrictDict({
  fetchBlock,
  fetchUnit,
  initialize,
  saveBlock,
});
