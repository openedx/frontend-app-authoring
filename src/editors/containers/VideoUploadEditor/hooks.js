// This 'module' self-import hack enables mocking during tests.
// See src/editors/decisions/0005-internal-editor-testability-decisions.md. The whole approach to how hooks are tested
// should be re-thought and cleaned up to avoid this pattern.
// eslint-disable-next-line import/no-self-import
import * as module from './hooks';
import { selectors, thunkActions } from '../../data/redux';
import store from '../../data/store';
import * as appHooks from '../../hooks';

export const {
  navigateTo,
} = appHooks;

export const postUploadRedirect = (storeState, uploadType = 'selectedVideoUrl') => {
  const learningContextId = selectors.app.learningContextId(storeState);
  const blockId = selectors.app.blockId(storeState);
  return (videoUrl) => navigateTo(`/course/${learningContextId}/editor/video/${blockId}?${uploadType}=${videoUrl}`);
};

export const onVideoUpload = (uploadType) => {
  const storeState = store.getState();
  return module.postUploadRedirect(storeState, uploadType);
};

export const useUploadVideo = async ({
  dispatch,
  supportedFiles,
  setLoadSpinner,
  postUploadRedirectFunction,
}) => {
  dispatch(thunkActions.video.uploadVideo({
    supportedFiles,
    setLoadSpinner,
    postUploadRedirectFunction,
  }));
};

export const useHistoryGoBack = () => (() => window.history.back());

export default {
  postUploadRedirect,
  onVideoUpload,
  useUploadVideo,
  useHistoryGoBack,
};
