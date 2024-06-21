/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { isEmpty } from 'lodash';

import { RequestStatus } from '../../../data/constants';

const slice = createSlice({
  name: 'assets',
  initialState: {
    assetIds: [],
    loadingStatus: RequestStatus.IN_PROGRESS,
    duplicateFiles: [],
    updatingStatus: '',
    addingStatus: '',
    deletingStatus: '',
    usageStatus: '',
    errors: {
      add: [],
      delete: [],
      lock: [],
      download: [],
      usageMetrics: [],
      loading: '',
    },
  },
  reducers: {
    setAssetIds: (state, { payload }) => {
      if (isEmpty(state.assetIds)) {
        state.assetIds = payload.assetIds;
      } else {
        state.assetIds = [...state.assetIds, ...payload.assetIds];
      }
    },
    setSortedAssetIds: (state, { payload }) => {
      state.assetIds = payload.assetIds;
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
        case 'lock':
          state.updatingStatus = status;
          break;
        case 'download':
          state.updatingStatus = status;
          break;
        case 'usageMetrics':
          state.usageStatus = status;
          break;
        default:
          break;
      }
    },
    deleteAssetSuccess: (state, { payload }) => {
      state.assetIds = state.assetIds.filter(id => id !== payload.assetId);
    },
    addAssetSuccess: (state, { payload }) => {
      state.assetIds = [payload.assetId, ...state.assetIds];
    },
    updateDuplicateFiles: (state, { payload }) => {
      state.duplicateFiles = payload.files;
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
  setAssetIds,
  setSortedAssetIds,
  updateLoadingStatus,
  deleteAssetSuccess,
  addAssetSuccess,
  updateErrors,
  clearErrors,
  updateEditStatus,
  updateDuplicateFiles,
} = slice.actions;

export const {
  reducer,
} = slice;
