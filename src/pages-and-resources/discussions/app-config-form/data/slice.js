/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

export const LOADING = 'LOADING';
export const LOADED = 'LOADED';
export const FAILED = 'FAILED';
export const SAVING = 'SAVING';
export const SAVED = 'SAVED';
export const DIRTY = 'DIRTY';

const slice = createSlice({
  name: 'appConfigForm',
  initialState: {
    // app config state
    appId: null,
    appConfigId: null,
    appConfigStatus: LOADING,
  },
  reducers: {
    loadAppConfig: (state, { payload }) => {
      state.appId = payload.appId;
      state.appConfigId = payload.appConfigId;
      state.featureIds = payload.featureIds;
      state.status = LOADED;
    },
    updateStatus: (state, { status }) => {
      state.status = status;
    },
  },
});

export const {
  loadAppConfig,
  updateStatus,
} = slice.actions;

export const {
  reducer,
} = slice;
