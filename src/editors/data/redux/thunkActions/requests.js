import { StrictDict } from '../../../utils';

import { RequestKeys } from '../../constants/requests';
import { actions, selectors } from '..';
import api, { loadImages } from '../../services/cms/api';

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
  return promise
    .then((response) => {
      if (onSuccess) {
        onSuccess(response);
      }
      dispatch(actions.requests.completeRequest({ requestKey, response }));
    })
    .catch((error) => {
      if (onFailure) {
        onFailure(error);
      }
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

 * Tracked fetchStudioView api method.
 * Tracked to the `fetchBlock` request key.
 * @param {[func]} onSuccess - onSuccess method ((response) => { ... })
 * @param {[func]} onFailure - onFailure method ((error) => { ... })
 */
export const fetchStudioView = ({ ...rest }) => (dispatch, getState) => {
  dispatch(module.networkRequest({
    requestKey: RequestKeys.fetchStudioView,
    promise: api.fetchStudioView({
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
      learningContextId: selectors.app.learningContextId(getState()),
      content,
      studioEndpointUrl: selectors.app.studioEndpointUrl(getState()),
      title: selectors.app.blockTitle(getState()),
    }),
    ...rest,
  }));
};
export const uploadAsset = ({ asset, ...rest }) => (dispatch, getState) => {
  dispatch(module.networkRequest({
    requestKey: RequestKeys.uploadAsset,
    promise: api.uploadAsset({
      learningContextId: selectors.app.learningContextId(getState()),
      asset,
      studioEndpointUrl: selectors.app.studioEndpointUrl(getState()),
    }),
    ...rest,
  }));
};

export const fetchAssets = ({ ...rest }) => (dispatch, getState) => {
  dispatch(module.networkRequest({
    requestKey: RequestKeys.fetchAssets,
    promise: api
      .fetchAssets({
        studioEndpointUrl: selectors.app.studioEndpointUrl(getState()),
        learningContextId: selectors.app.learningContextId(getState()),
      })
      .then((response) => loadImages(response.data.assets)),
    ...rest,
  }));
};

export const allowThumbnailUpload = ({ ...rest }) => (dispatch, getState) => {
  dispatch(module.networkRequest({
    requestKey: RequestKeys.allowThumbnailUpload,
    promise: api.allowThumbnailUpload({
      studioEndpointUrl: selectors.app.studioEndpointUrl(getState()),
    }),
    ...rest,
  }));
};

export const uploadThumbnail = ({ thumbnail, videoId, ...rest }) => (dispatch, getState) => {
  dispatch(module.networkRequest({
    requestKey: RequestKeys.uploadThumbnail,
    promise: api.uploadThumbnail({
      studioEndpointUrl: selectors.app.studioEndpointUrl(getState()),
      learningContextId: selectors.app.learningContextId(getState()),
      thumbnail,
      videoId,
    }),
    ...rest,
  }));
};

export const checkTranscriptsForImport = ({ videoId, youTubeId, ...rest }) => (dispatch, getState) => {
  dispatch(module.networkRequest({
    requestKey: RequestKeys.checkTranscriptsForImport,
    promise: api.checkTranscriptsForImport({
      blockId: selectors.app.blockId(getState()),
      videoId,
      youTubeId,
      studioEndpointUrl: selectors.app.studioEndpointUrl(getState()),
    }),
    ...rest,
  }));
};

export const importTranscript = ({ youTubeId, ...rest }) => (dispatch, getState) => {
  dispatch(module.networkRequest({
    requestKey: RequestKeys.importTranscript,
    promise: api.importTranscript({
      blockId: selectors.app.blockId(getState()),
      studioEndpointUrl: selectors.app.studioEndpointUrl(getState()),
      youTubeId,
    }),
    ...rest,
  }));
};

export const deleteTranscript = ({ language, videoId, ...rest }) => (dispatch, getState) => {
  dispatch(module.networkRequest({
    requestKey: RequestKeys.deleteTranscript,
    promise: api.deleteTranscript({
      blockId: selectors.app.blockId(getState()),
      language,
      videoId,
      studioEndpointUrl: selectors.app.studioEndpointUrl(getState()),
    }),
    ...rest,
  }));
};

export const uploadTranscript = ({
  transcript,
  videoId,
  language,
  ...rest
}) => (dispatch, getState) => {
  dispatch(module.networkRequest({
    requestKey: RequestKeys.uploadTranscript,
    promise: api.uploadTranscript({
      blockId: selectors.app.blockId(getState()),
      transcript,
      videoId,
      language,
      studioEndpointUrl: selectors.app.studioEndpointUrl(getState()),
    }),
    ...rest,
  }));
};

export const updateTranscriptLanguage = ({
  file,
  languageBeforeChange,
  newLanguageCode,
  videoId,
  ...rest
}) => (dispatch, getState) => {
  dispatch(module.networkRequest({
    requestKey: RequestKeys.updateTranscriptLanguage,
    promise: api.uploadTranscript({
      blockId: selectors.app.blockId(getState()),
      transcript: file,
      videoId,
      language: languageBeforeChange,
      newLanguage: newLanguageCode,
      studioEndpointUrl: selectors.app.studioEndpointUrl(getState()),
    }),
    ...rest,
  }));
};

export const getTranscriptFile = ({ language, videoId, ...rest }) => (dispatch, getState) => {
  dispatch(module.networkRequest({
    requestKey: RequestKeys.getTranscriptFile,
    promise: api.getTranscript({
      studioEndpointUrl: selectors.app.studioEndpointUrl(getState()),
      blockId: selectors.app.blockId(getState()),
      videoId,
      language,
    }),
    ...rest,
  }));
};

export const fetchCourseDetails = ({ ...rest }) => (dispatch, getState) => {
  dispatch(module.networkRequest({
    requestKey: RequestKeys.fetchCourseDetails,
    promise: api.fetchCourseDetails({
      studioEndpointUrl: selectors.app.studioEndpointUrl(getState()),
      learningContextId: selectors.app.learningContextId(getState()),
    }),
    ...rest,
  }));
};

export const fetchAdvanceSettings = ({ ...rest }) => (dispatch, getState) => {
  dispatch(module.networkRequest({
    requestKey: RequestKeys.fetchAdvanceSettings,
    promise: api.fetchAdvanceSettings({
      studioEndpointUrl: selectors.app.studioEndpointUrl(getState()),
      learningContextId: selectors.app.learningContextId(getState()),
    }),
    ...rest,
  }));
};

export default StrictDict({
  fetchBlock,
  fetchStudioView,
  fetchUnit,
  saveBlock,
  fetchAssets,
  uploadAsset,
  allowThumbnailUpload,
  uploadThumbnail,
  deleteTranscript,
  uploadTranscript,
  updateTranscriptLanguage,
  fetchCourseDetails,
  getTranscriptFile,
  checkTranscriptsForImport,
  importTranscript,
  fetchAdvanceSettings,
});
