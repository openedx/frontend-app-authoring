/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

export const LOADING = 'LOADING';
export const LOADED = 'LOADED';
export const FAILED = 'FAILED';
export const SAVING = 'SAVING';
export const SAVED = 'SAVED';
export const DIRTY = 'DIRTY';

const slice = createSlice({
  name: 'discussions',
  initialState: {
    appIds: [],
    activeAppId: null,
    activeAppConfigId: null,
    featureIds: [],
    status: LOADING,
  },
  reducers: {
    fetchAppsSuccess: (state, { payload }) => {
      state.appIds = payload.appIds;
      state.featureIds = payload.featureIds;
      state.activeAppId = payload.activeAppId;
    },
    fetchAppConfigSuccess: (state, { payload }) => {
      state.activeAppId = payload.activeAppId;
      state.activeAppConfigId = payload.activeAppConfigId;
      state.featureIds = payload.featureIds;
    },
    updateStatus: (state, { payload }) => {
      state.status = payload.status;
    },
  },
});

export const {
  fetchAppsSuccess,
  fetchAppConfigSuccess,
  updateStatus,
} = slice.actions;

export const {
  reducer,
} = slice;
