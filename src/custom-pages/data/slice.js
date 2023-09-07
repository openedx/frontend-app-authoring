/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { RequestStatus } from '../../data/constants';

const slice = createSlice({
  name: 'customPages',
  initialState: {
    customPagesIds: [],
    loadingStatus: RequestStatus.IN_PROGRESS,
    savingStatus: '',
    addingStatus: 'default',
    deletingStatus: '',
  },
  reducers: {
    setPageIds: (state, { payload }) => {
      state.customPagesIds = payload.customPagesIds;
    },
    updateLoadingStatus: (state, { payload }) => {
      state.loadingStatus = payload.status;
    },
    updateSavingStatus: (state, { payload }) => {
      state.savingStatus = payload.status;
    },
    updateAddingStatus: (state, { payload }) => {
      state.addingStatus = payload.status;
    },
    updateDeletingStatus: (state, { payload }) => {
      state.deletingStatus = payload.status;
    },
    deleteCustomPageSuccess: (state, { payload }) => {
      state.customPagesIds = state.customPagesIds.filter(id => id !== payload.customPageId);
    },
    addCustomPageSuccess: (state, { payload }) => {
      state.customPagesIds = [...state.customPagesIds, payload.customPageId];
    },
  },
});

export const {
  setPageIds,
  updateLoadingStatus,
  updateSavingStatus,
  updateCustomPagesApiStatus,
  deleteCustomPageSuccess,
  updateDeletingStatus,
  addCustomPageSuccess,
  updateAddingStatus,
} = slice.actions;

export const {
  reducer,
} = slice;
