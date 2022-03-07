import { StrictDict } from '../../../utils';

import { RequestKeys } from '../../constants/requests';
import { actions, selectors } from '..';
import api from '../../services/cms/api';

import * as module from './requests';

/**
 * Wrapper around a network request promise, that sends actions to the redux store to
 * track the state of that promise.
 * Tracks the promise by requestKey, and sends an action when it is started, succeeds, or
 * fails.  It also accepts onSuccess and onFailure methods to be called with the output
 * of failure or success of the promise.
 * @param {string} requestKey - request tracking identifier
 * @param {Promise} promise - api event promise
 * @param {[func]} onSuccess - onSuccess method ((response) => { ... })
 * @param {[func]} onFailure - onFailure method ((error) => { ... })
 */
export const networkRequest = ({
  requestKey,
  promise,
  onSuccess,
  onFailure,
}) => (dispatch) => {
  dispatch(actions.requests.startRequest(requestKey));
  return promise.then((response) => {
    if (onSuccess) { onSuccess(response); }
    dispatch(actions.requests.completeRequest({ requestKey, response }));
  }).catch((error) => {
    if (onFailure) { onFailure(error); }
    dispatch(actions.requests.failRequest({ requestKey, error }));
  });
};

/**
 * Tracked fetchByBlockId api method.
 * Tracked to the `fetchBlock` request key.
 * @param {[func]} onSuccess - onSuccess method ((response) => { ... })
 * @param {[func]} onFailure - onFailure method ((error) => { ... })
 */
export const fetchBlock = ({ ...rest }) => (dispatch, getState) => {
  dispatch(module.networkRequest({
    requestKey: RequestKeys.fetchBlock,
    promise: api.fetchBlockById({
      studioEndpointUrl: selectors.app.studioEndpointUrl(getState()),
      blockId: selectors.app.blockId(getState()),
    }),
    ...rest,
  }));
};

/**
 * Tracked fetchByUnitId api method.
 * Tracked to the `fetchUnit` request key.
 * @param {[func]} onSuccess - onSuccess method ((response) => { ... })
 * @param {[func]} onFailure - onFailure method ((error) => { ... })
 */
export const fetchUnit = ({ ...rest }) => (dispatch, getState) => {
  dispatch(module.networkRequest({
    requestKey: RequestKeys.fetchUnit,
    promise: api.fetchByUnitId({
      studioEndpointUrl: selectors.app.studioEndpointUrl(getState()),
      blockId: selectors.app.blockId(getState()),
    }),
    ...rest,
  }));
};

/**
 * Tracked saveBlock api method.  Tracked to the `saveBlock` request key.
 * @param {string} content
 * @param {[func]} onSuccess - onSuccess method ((response) => { ... })
 * @param {[func]} onFailure - onFailure method ((error) => { ... })
 */
export const saveBlock = ({ content, ...rest }) => (dispatch, getState) => {
  dispatch(module.networkRequest({
    requestKey: RequestKeys.saveBlock,
    promise: api.saveBlock({
      blockId: selectors.app.blockId(getState()),
      blockType: selectors.app.blockType(getState()),
      courseId: selectors.app.courseId(getState()),
      content,
      studioEndpointUrl: selectors.app.studioEndpointUrl(getState()),
      title: selectors.app.title(getState()),
    }),
    ...rest,
  }));
};

export default StrictDict({
  fetchUnit,
  fetchBlock,
  saveBlock,
});
