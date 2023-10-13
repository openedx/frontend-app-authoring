/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { RequestStatus } from 'CourseAuthoring/data/constants';

const slice = createSlice({
  name: 'live',
  initialState: {
    appIds: [],
    // activeAppId is the ID of the app that has been configured for the course.
    activeAppId: null,
    // selectedAppId is the ID of the app that has been selected in the UI.  This happens when an
    // activeAppId has been configured but the user is about to configure a different provider
    // instead.
    selectedAppId: null,
    status: RequestStatus.IN_PROGRESS,
    saveStatus: RequestStatus.SUCCESSFUL,
  },
  reducers: {
    loadApps: (state, { payload }) => {
      state.status = RequestStatus.SUCCESSFUL;
      state.saveStatus = RequestStatus.SUCCESSFUL;
      Object.assign(state, payload);
    },
    selectApp: (state, { payload }) => {
      const { appId } = payload;
      state.selectedAppId = appId;
    },
    updateStatus: (state, { payload }) => {
      const { status } = payload;
      state.status = status;
    },
    updateSaveStatus: (state, { payload }) => {
      const { status } = payload;
      state.saveStatus = status;
    },
  },
});

export const {
  loadApps,
  selectApp,
  updateStatus,
  updateSaveStatus,
} = slice.actions;

export const {
  reducer,
} = slice;
