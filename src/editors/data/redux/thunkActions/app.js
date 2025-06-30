import { StrictDict, camelizeKeys } from '../../../utils';
import * as requests from './requests';
// This 'module' self-import hack enables mocking during tests.
// See src/editors/decisions/0005-internal-editor-testability-decisions.md. The whole approach to how hooks are tested
// should be re-thought and cleaned up to avoid this pattern.
// eslint-disable-next-line import/no-self-import
import * as module from './app';
import { actions as appActions, selectors } from '../app';
import { actions as requestsActions } from '../requests';
import { RequestKeys } from '../../constants/requests';

// Similar to `import { actions } from '..';` but avoid circular imports:
const actions = {
  app: appActions,
  requests: requestsActions,
};

export const fetchBlock = () => (dispatch) => {
  dispatch(requests.fetchBlock({
    onSuccess: (response) => {
      dispatch(actions.app.setBlockValue(response));
      dispatch(actions.app.setShowRawEditor(response));
    },
    onFailure: (error) => dispatch(actions.requests.failRequest({
      requestKey: RequestKeys.fetchBlock,
      error,
    })),
  }));
};

export const fetchStudioView = () => (dispatch) => {
  dispatch(requests.fetchStudioView({
    onSuccess: (response) => dispatch(actions.app.setStudioView(response)),
    onFailure: (error) => dispatch(actions.requests.failRequest({
      requestKey: RequestKeys.fetchStudioView,
      error,
    })),
  }));
};

export const fetchUnit = () => (dispatch) => {
  dispatch(requests.fetchUnit({
    onSuccess: (response) => dispatch(actions.app.setUnitUrl(response)),
    onFailure: (error) => dispatch(actions.requests.failRequest({
      requestKey: RequestKeys.fetchUnit,
      error,
    })),
  }));
};

export const fetchImages = ({ pageNumber }) => (dispatch) => {
  dispatch(requests.fetchImages({
    pageNumber,
    onSuccess: ({ images, imageCount }) => dispatch(actions.app.setImages({ images, imageCount })),
    onFailure: (error) => dispatch(actions.requests.failRequest({
      requestKey: RequestKeys.fetchImages,
      error,
    })),
  }));
};

export const fetchVideos = () => (dispatch) => {
  dispatch(requests.fetchVideos({
    onSuccess: (response) => dispatch(actions.app.setVideos(response.data.videos)),
    onFailure: (error) => dispatch(actions.requests.failRequest({
      requestKey: RequestKeys.fetchVideos,
      error,
    })),
  }));
};

export const fetchCourseDetails = () => (dispatch) => {
  dispatch(requests.fetchCourseDetails({
    onSuccess: (response) => dispatch(actions.app.setCourseDetails(response)),
    onFailure: (error) => dispatch(actions.requests.failRequest({
      requestKey: RequestKeys.fetchCourseDetails,
      error,
    })),
  }));
};

/**
 * @param {string} studioEndpointUrl
 * @param {string} blockId
 * @param {string} learningContextId
 * @param {string} blockType
 */
export const initialize = (data) => (dispatch) => {
  const editorType = data.blockType;
  dispatch({ type: 'resetEditor' });
  dispatch(actions.app.initialize(data));

  if (data.blockId === '' && editorType) {
    dispatch(actions.app.initializeEditor());
    return;
  }

  dispatch(module.fetchBlock());
  if (data.blockId?.startsWith('block-v1:')) {
    dispatch(module.fetchUnit());
  }
  switch (editorType) {
    case 'problem':
      dispatch(module.fetchImages({ pageNumber: 0 }));
      break;
    case 'video':
      dispatch(module.fetchVideos());
      dispatch(module.fetchStudioView());
      dispatch(module.fetchCourseDetails());
      break;
    case 'html':
      dispatch(module.fetchImages({ pageNumber: 0 }));
      break;
    default:
      break;
  }
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
      const parsedData = JSON.parse(response.config.data);
      if (parsedData?.has_changes) {
        const storageKey = 'courseRefreshTriggerOnComponentEditSave';
        localStorage.setItem(storageKey, Date.now());

        window.dispatchEvent(new StorageEvent('storage', {
          key: storageKey,
          newValue: Date.now().toString(),
        }));
      }
      returnToUnit(response.data);
    },
  }));
};

/**
 * @param {func} onSuccess
 */
export const createBlock = (content, returnToUnit) => (dispatch, getState) => {
  dispatch(requests.createBlock({
    onSuccess: (response) => {
      dispatch(actions.app.setBlockId(response.id));
      const newImages = Object.values(selectors.images(getState())).map((image) => image.file);

      if (newImages.length === 0) {
        dispatch(saveBlock(content, returnToUnit));
        return;
      }
      dispatch(requests.batchUploadAssets({
        assets: newImages,
        content,
        onSuccess: (updatedContent) => dispatch(saveBlock(updatedContent, returnToUnit)),
        onFailure: (error) => dispatch(actions.requests.failRequest({
          requestKey: RequestKeys.batchUploadAssets,
          error,
        })),
      }));
    },
    onFailure: (error) => dispatch(actions.requests.failRequest({
      requestKey: RequestKeys.createBlock,
      error,
    })),
  }));
};

export const uploadAsset = ({ file, setSelection }) => (dispatch, getState) => {
  if (selectors.shouldCreateBlock(getState())) {
    const tempFileURL = URL.createObjectURL(file);
    const tempImage = {
      displayName: file.name,
      url: tempFileURL,
      externalUrl: tempFileURL,
      portableUrl: tempFileURL,
      thumbnail: tempFileURL,
      id: file.name,
      locked: false,
      file,
    };
    setSelection(tempImage);
    dispatch(appActions.setImages({ images: { [file.name]: tempImage }, imageCount: 1 }));
    return;
  }

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
  fetchImages,
  uploadAsset,
  createBlock,
});
