/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { RequestStatus } from '../../data/constants';

const slice = createSlice({
  name: 'pagesAndResources',
  initialState: {
    courseAppIds: [],
    loadingStatus: RequestStatus.IN_PROGRESS,
    savingStatus: '',
    resetStatus: '',
    courseAppsApiStatus: {},
    courseAppSettings: {},
  },
  reducers: {
    fetchCourseAppsSuccess: (state, { payload }) => {
      state.courseAppIds = payload.courseAppIds;
    },
    updateLoadingStatus: (state, { payload }) => {
      state.loadingStatus = payload.status;
    },
    updateSavingStatus: (state, { payload }) => {
      state.savingStatus = payload.status;
    },
    updateResetStatus: (state, { payload }) => {
      state.resetStatus = payload.status;
    },
    updateCourseAppsApiStatus: (state, { payload }) => {
      state.courseAppsApiStatus = payload.status;
    },
    fetchCourseAppsSettingsSuccess: (state, { payload }) => {
      Object.assign(state.courseAppSettings, payload);
    },
    updateCourseAppsSettingsSuccess: (state, { payload }) => {
      Object.assign(state.courseAppSettings, payload);
    },
  },
});

export const {
  fetchCourseAppsSuccess,
  updateLoadingStatus,
  updateSavingStatus,
  updateResetStatus,
  updateCourseAppsApiStatus,
  fetchCourseAppsSettingsSuccess,
  updateCourseAppsSettingsSuccess,
} = slice.actions;

export const {
  reducer,
} = slice;
