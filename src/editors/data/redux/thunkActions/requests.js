import { StrictDict, parseLibraryImageData, getLibraryImageAssets } from '../../../utils';

import { RequestKeys } from '../../constants/requests';
import api, { loadImages } from '../../services/cms/api';
import { actions as requestsActions } from '../requests';
import { selectors as appSelectors } from '../app';

// This 'module' self-import hack enables mocking during tests.
// See src/editors/decisions/0005-internal-editor-testability-decisions.md. The whole approach to how hooks are tested
// should be re-thought and cleaned up to avoid this pattern.
// eslint-disable-next-line import/no-self-import
import * as module from './requests';
import { isLibraryKey } from '../../../../generic/key-utils';
import { acceptedImgKeys } from '../../../sharedComponents/ImageUploadModal/SelectImageModal/utils';

// Similar to `import { actions, selectors } from '..';` but avoid circular imports:
const actions = { requests: requestsActions };
const selectors = { app: appSelectors };

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
  const learningContextId = selectors.app.learningContextId(getState());
  dispatch(module.networkRequest({
    requestKey: RequestKeys.uploadAsset,
    promise: api.uploadAsset({
      learningContextId,
      asset,
      studioEndpointUrl: selectors.app.studioEndpointUrl(getState()),
      blockId: selectors.app.blockId(getState()),
    }).then((resp) => {
      if (isLibraryKey(learningContextId)) {
        return ({
          ...resp,
          data: { asset: parseLibraryImageData(resp.data) },
        });
      }
      return resp;
    }),
    ...rest,
  }));
};

export const fetchImages = ({ pageNumber, ...rest }) => (dispatch, getState) => {
  const learningContextId = selectors.app.learningContextId(getState());
  if (isLibraryKey(learningContextId)) {
    dispatch(module.networkRequest({
      requestKey: RequestKeys.fetchImages,
      promise: api
        .fetchLibraryImages({
          pageNumber,
          blockId: selectors.app.blockId(getState()),
          studioEndpointUrl: selectors.app.studioEndpointUrl(getState()),
          learningContextId,
        })
        .then(({ data }) => {
          const images = getLibraryImageAssets(data.files, Object.keys(acceptedImgKeys));
          return { images, imageCount: Object.keys(images).length };
        }),
      ...rest,
    }));
    return;
  }
  dispatch(module.networkRequest({
    requestKey: RequestKeys.fetchImages,
    promise: api
      .fetchCourseImages({
        pageNumber,
        blockId: selectors.app.blockId(getState()),
        studioEndpointUrl: selectors.app.studioEndpointUrl(getState()),
        learningContextId,
      })
      .then(({ data }) => ({ images: loadImages(data.assets), imageCount: data.totalCount })),
    ...rest,
  }));
};

export const fetchVideos = ({ ...rest }) => (dispatch, getState) => {
  dispatch(module.networkRequest({
    requestKey: RequestKeys.fetchVideos,
    promise: api
      .fetchVideos({
        studioEndpointUrl: selectors.app.studioEndpointUrl(getState()),
        learningContextId: selectors.app.learningContextId(getState()),
      }),
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

export const fetchAdvancedSettings = ({ ...rest }) => (dispatch, getState) => {
  dispatch(module.networkRequest({
    requestKey: RequestKeys.fetchAdvancedSettings,
    promise: api.fetchAdvancedSettings({
      studioEndpointUrl: selectors.app.studioEndpointUrl(getState()),
      learningContextId: selectors.app.learningContextId(getState()),
    }),
    ...rest,
  }));
};

export const fetchVideoFeatures = ({ ...rest }) => (dispatch, getState) => {
  dispatch(module.networkRequest({
    requestKey: RequestKeys.fetchVideoFeatures,
    promise: api.fetchVideoFeatures({
      studioEndpointUrl: selectors.app.studioEndpointUrl(getState()),
    }),
    ...rest,
  }));
};

export const uploadVideo = ({ data, ...rest }) => (dispatch, getState) => {
  dispatch(module.networkRequest({
    requestKey: RequestKeys.uploadVideo,
    promise: api.uploadVideo({
      data,
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
  fetchImages,
  fetchVideos,
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
  fetchAdvancedSettings,
  fetchVideoFeatures,
  uploadVideo,
});
