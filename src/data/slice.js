/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

export const LOADED = 'LOADED';

const slice = createSlice({
  name: 'courseDetail',
  initialState: {
    courseId: null,
    status: null,
    canChangeProvider: null,
    waffleFlags: {
      useNewHomePage: true,
      useNewCustomPages: true,
      useNewScheduleDetailsPage: true,
      useNewAdvancedSettingsPage: true,
      useNewGradingPage: true,
      useNewUpdatesPage: true,
      useNewImportPage: false,
      useNewExportPage: true,
      useNewFilesUploadsPage: true,
      useNewVideoUploadsPage: true,
      useNewCourseOutlinePage: true,
      useNewUnitPage: false,
      useNewCourseTeamPage: true,
      useNewCertificatesPage: true,
      useNewTextbooksPage: true,
      useNewGroupConfigurationsPage: true,
    },
  },
  reducers: {
    updateStatus: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.status = payload.status;
    },
    updateCanChangeProviders: (state, { payload }) => {
      state.canChangeProviders = payload.canChangeProviders;
    },
    fetchWaffleFlagsSuccess: (state, { payload }) => {
      state.waffleFlags = payload.waffleFlags;
    },
  },
});

export const {
  updateStatus,
  updateCanChangeProviders,
  fetchWaffleFlagsSuccess,
} = slice.actions;

export const {
  reducer,
} = slice;
