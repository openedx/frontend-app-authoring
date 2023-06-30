import React from 'react';
import * as module from './hooks';
import { selectors } from '../../data/redux';
import store from '../../data/store';
import * as appHooks from '../../hooks';

const extToMime = {
  mp4: 'video/mp4',
  mov: 'video/quicktime',
};

export const {
  navigateTo,
} = appHooks;

export const state = {
  loading: (val) => React.useState(val),
  errorMessage: (val) => React.useState(val),
  textInputValue: (val) => React.useState(val),
};

export const uploadEditor = () => {
  const [loading, setLoading] = module.state.loading(false);
  const [errorMessage, setErrorMessage] = module.state.errorMessage(null);
  return {
    loading,
    setLoading,
    errorMessage,
    setErrorMessage,
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

const getFileExtension = (filename) => filename.slice(Math.abs(filename.lastIndexOf('.') - 1) + 2);

export const fileValidator = (setLoading, setErrorMessage, uploadVideo) => (file) => {
  const supportedFormats = Object.keys(extToMime);
  const ext = getFileExtension(file.name);
  const type = extToMime[ext] || '';
  const newFile = new File([file], file.name, { type });

  if (supportedFormats.includes(ext)) {
    uploadVideo({
      supportedFiles: [newFile],
      setLoadSpinner: setLoading,
      postUploadRedirect: onVideoUpload(),
    });
  } else {
    const errorMsg = 'Video must be an MP4 or MOV file';
    setErrorMessage(errorMsg);
  }
};

export default {
  postUploadRedirect,
  uploadEditor,
  uploader,
  onVideoUpload,
  fileValidator,
};
