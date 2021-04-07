/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

export const LOADING = 'LOADING';
export const LOADED = 'LOADED';
export const FAILED = 'FAILED';

const slice = createSlice({
  name: 'appList',
  initialState: {
    appIds: [],
    featureIds: [],
    // activeAppId is the ID of the app that has been configured for the course.
    activeAppId: null,
    // selectedAppId is the ID of the app that has been selected in the UI.  This happens when an
    // activeAppId has been configured but the user is about to configure a different provider
    // instead.
    selectedAppId: null,
    status: LOADING,
  },
  reducers: {
    loadApps: (state, { payload }) => {
      state.activeAppId = payload.activeAppId;
      state.appIds = payload.appIds;
      state.featureIds = payload.featureIds;
      state.status = LOADED;
    },
    selectApp: (state, { appId }) => {
      state.selectedAppId = appId;
    },
    updateStatus: (state, { status }) => {
      state.status = status;
    },
  },
});

export const {
  loadApps,
  selectApp,
  updateStatus,
} = slice.actions;

export const {
  reducer,
} = slice;
