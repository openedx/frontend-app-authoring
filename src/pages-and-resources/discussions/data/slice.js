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
    // "active" IDs are for the app and config that has been enabled for the course.
    activeAppId: null,
    // "displayed" IDs are for the app and config that are being configured in the UI.  They may be
    // the same as the "active" IDs.
    displayedAppId: null,
    displayedAppConfigId: null,
    featureIds: [],
    status: LOADING,
  },
  reducers: {
    fetchAppsSuccess: (state, { payload }) => {
      state.activeAppId = payload.activeAppId;
      state.appIds = payload.appIds;
      state.featureIds = payload.featureIds;
    },
    fetchAppConfigSuccess: (state, { payload }) => {
      state.displayedAppConfigId = payload.displayedAppConfigId;
      state.displayedAppId = payload.displayedAppId;
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
