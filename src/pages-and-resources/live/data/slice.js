/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { RequestStatus } from '../../../data/constants';

const slice = createSlice({
  name: 'live',
  initialState: {
    providers: {
      available: {},
      selectedProvider: {},
    },
    appIds: [],
    status: RequestStatus.IN_PROGRESS,
    configuration: {},
    saveStatus: RequestStatus.SUCCESSFUL,
  },
  reducers: {
    updateProviders: (state, { payload }) => {
      Object.assign(state.providers, payload);
    },
    updateConfiguration: (state, { payload }) => {
      Object.assign(state.configuration, payload);
      state.configuredProvider = payload.provider;
    },
    updateStatus: (state, { payload }) => {
      const { status } = payload;
      state.status = status;
    },
    updateAppIds: (state, { payload }) => {
      state.appIds = payload;
    },
    updateSaveStatus: (state, { payload }) => {
      const { status } = payload;
      state.saveStatus = status;
    },
  },
});

export const {
  updateProviders,
  updateConfiguration,
  updateStatus,
  updateSaveStatus,
  updateAppIds,
} = slice.actions;

export const {
  reducer,
} = slice;
