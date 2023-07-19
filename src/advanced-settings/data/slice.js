/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { RequestStatus } from '../../data/constants';

const slice = createSlice({
  name: 'advancedSettings',
  initialState: {
    loadingStatus: RequestStatus.IN_PROGRESS,
    savingStatus: '',
    courseAppSettings: {},
    proctoringErrors: {},
    sendRequestErrors: {},
  },
  reducers: {
    updateLoadingStatus: (state, { payload }) => {
      state.loadingStatus = payload.status;
    },
    updateSavingStatus: (state, { payload }) => {
      state.savingStatus = payload.status;
    },
    fetchCourseAppsSettingsSuccess: (state, { payload }) => {
      Object.assign(state.courseAppSettings, payload);
    },
    updateCourseAppsSettingsSuccess: (state, { payload }) => {
      Object.assign(state.courseAppSettings, payload);
    },
    getDataSendErrors: (state, { payload }) => {
      Object.assign(state.sendRequestErrors, payload);
    },
    fetchProctoringExamErrorsSuccess: (state, { payload }) => {
      Object.assign(state.proctoringErrors, payload);
    },
  },
});

export const {
  updateLoadingStatus,
  updateSavingStatus,
  getDataSendErrors,
  fetchCourseAppsSettingsSuccess,
  updateCourseAppsSettingsSuccess,
  fetchProctoringExamErrorsSuccess,
} = slice.actions;

export const {
  reducer,
} = slice;
