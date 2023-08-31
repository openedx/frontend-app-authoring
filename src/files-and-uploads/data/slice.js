/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { RequestStatus } from '../../data/constants';

const slice = createSlice({
  name: 'assets',
  initialState: {
    assetIds: [],
    loadingStatus: RequestStatus.IN_PROGRESS,
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
    },
    totalCount: 0,
  },
  reducers: {
    setAssetIds: (state, { payload }) => {
      state.assetIds = payload.assetIds;
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
  setAssetIds,
  setTotalCount,
  updateLoadingStatus,
  deleteAssetSuccess,
  addAssetSuccess,
  updateErrors,
  clearErrors,
  updateEditStatus,
} = slice.actions;

export const {
  reducer,
} = slice;
