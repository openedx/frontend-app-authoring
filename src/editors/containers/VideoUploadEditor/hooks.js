import React from 'react';
import * as module from './hooks';
import { selectors } from '../../data/redux';
import store from '../../data/store';
import * as appHooks from '../../hooks';

export const {
  navigateTo,
} = appHooks;

export const state = {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  loading: (val) => React.useState(val),
  // eslint-disable-next-line react-hooks/rules-of-hooks
  textInputValue: (val) => React.useState(val),
};

export const uploadEditor = () => {
  const [loading, setLoading] = module.state.loading(false);
  return {
    loading,
    setLoading,
  };
};

export const uploader = () => {
  const [textInputValue, settextInputValue] = module.state.textInputValue('');
  return {
    textInputValue,
    settextInputValue,
  };
};

export const postUploadRedirect = (storeState) => {
  const learningContextId = selectors.app.learningContextId(storeState);
  const blockId = selectors.app.blockId(storeState);
  return (videoUrl) => navigateTo(`/course/${learningContextId}/editor/video/${blockId}?selectedVideoUrl=${videoUrl}`);
};

export const onVideoUpload = () => {
  const storeState = store.getState();
  return module.postUploadRedirect(storeState);
};

export default {
  postUploadRedirect,
  uploadEditor,
  uploader,
  onVideoUpload,
};
