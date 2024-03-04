/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { RequestStatus } from '../../../data/constants';

const slice = createSlice({
  name: 'videos',
  initialState: {
    videoIds: [],
    pageSettings: {},
    loadingStatus: RequestStatus.IN_PROGRESS,
    updatingStatus: '',
    addingStatus: '',
    uploadNewVideoProgress: 0,
    deletingStatus: '',
    usageStatus: '',
    transcriptStatus: '',
    errors: {
      add: [],
      delete: [],
      thumbnail: [],
      download: [],
      usageMetrics: [],
      transcript: [],
      loading: '',
    },
  },
  reducers: {
    setVideoIds: (state, { payload }) => {
      state.videoIds = payload.videoIds;
    },
    setPageSettings: (state, { payload }) => {
      state.pageSettings = payload;
    },
    updateLoadingStatus: (state, { payload }) => {
      state.loadingStatus = payload.status;
    },
    updateEditStatus: (state, { payload }) => {
      const { editType, status } = payload;
      switch (editType) {
      case 'delete':
        state.deletingStatus = status;
        break;
      case 'add':
        state.addingStatus = status;
        break;
      case 'thumbnail':
        state.updatingStatus = status;
        break;
      case 'download':
        state.updatingStatus = status;
        break;
      case 'usageMetrics':
        state.usageStatus = status;
        break;
      case 'transcript':
        state.transcriptStatus = status;
        break;
      default:
        break;
      }
    },
    deleteVideoSuccess: (state, { payload }) => {
      state.videoIds = state.videoIds.filter(id => id !== payload.videoId);
    },
    addVideoById: (state, { payload }) => {
      state.videoIds = [payload.videoId, ...state.videoIds];
    },
    updateVideoUploadProgress: (state, {payload}) =>{
      state.uploadNewVideoProgress = payload.uploadNewVideoProgress;
    },
    updateTranscriptCredentialsSuccess: (state, { payload }) => {
      const { provider } = payload;
      state.pageSettings.transcriptCredentials = {
        ...state.pageSettings.transcriptCredentials,
        [provider]: true,
      };
    },
    updateTranscriptPreferenceSuccess: (state, { payload }) => {
      state.pageSettings.activeTranscriptPreferences = payload;
    },
    updateErrors: (state, { payload }) => {
      const { error, message } = payload;
      if (error === 'loading') {
        state.errors.loading = message;
      } else {
        const currentErrorState = state.errors[error];
        state.errors[error] = [...currentErrorState, message];
      }
    },
    clearErrors: (state, { payload }) => {
      const { error } = payload;
      state.errors[error] = [];
    },
  },
});

export const {
  setVideoIds,
  setPageSettings,
  updateLoadingStatus,
  deleteVideoSuccess,
  addVideoSuccess,
  updateErrors,
  clearErrors,
  updateEditStatus,
  updateTranscriptCredentialsSuccess,
  updateTranscriptPreferenceSuccess,
} = slice.actions;

export const {
  reducer,
} = slice;
