/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

export const LOADING = 'LOADING';
export const LOADED = 'LOADED';
export const FAILED = 'FAILED';

const slice = createSlice({
  name: 'discussions',
  initialState: {
    appIds: [],
    featureIds: [],
    status: LOADING,
  },
  reducers: {
    fetchAppsSuccess: (state, { payload }) => {
      state.appIds = payload.appIds;
      state.featureIds = payload.featureIds;
      state.status = LOADED;
    },
    updateStatus: (state, { payload }) => {
      state.status = payload.status;
    },
  },
});

export const {
  fetchAppsSuccess,
  updateStatus,
} = slice.actions;

export const {
  reducer,
} = slice;
