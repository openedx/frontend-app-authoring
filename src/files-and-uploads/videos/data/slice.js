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
    },
    totalCount: 0,
  },
  reducers: {
    setVideoIds: (state, { payload }) => {
      state.videoIds = payload.videoIds;
    },
    setPageSettings: (state, { payload }) => {
      state.pageSettings = payload;
    },
    setTotalCount: (state, { payload }) => {
      state.totalCount = payload.totalCount;
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
    addVideoSuccess: (state, { payload }) => {
      state.videoIds = [payload.videoId, ...state.videoIds];
    },
    updateErrors: (state, { payload }) => {
      const { error, message } = payload;
      const currentErrorState = state.errors[error];
      state.errors[error] = [...currentErrorState, message];
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
  setTotalCount,
  updateLoadingStatus,
  deleteVideoSuccess,
  addVideoSuccess,
  updateErrors,
  clearErrors,
  updateEditStatus,
} = slice.actions;

export const {
  reducer,
} = slice;
