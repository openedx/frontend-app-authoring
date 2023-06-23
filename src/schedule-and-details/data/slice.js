/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { RequestStatus } from '../../data/constants';

const slice = createSlice({
  name: 'scheduleAndDetails',
  initialState: {
    loadingDetailsStatus: RequestStatus.IN_PROGRESS,
    loadingSettingsStatus: RequestStatus.IN_PROGRESS,
    savingStatus: '',
    courseDetails: {},
    courseSettings: {},
    uploadAssetsData: {},
  },
  reducers: {
    updateLoadingDetailsStatus: (state, { payload }) => {
      state.loadingDetailsStatus = payload.status;
    },
    updateLoadingSettingsStatus: (state, { payload }) => {
      state.loadingSettingsStatus = payload.status;
    },
    updateSavingStatus: (state, { payload }) => {
      state.savingStatus = payload.status;
    },
    updateCourseDetailsSuccess: (state, { payload }) => {
      Object.assign(state.courseDetails, payload);
    },
    fetchCourseDetailsSuccess: (state, { payload }) => {
      Object.assign(state.courseDetails, payload);
    },
    fetchCourseSettingsSuccess: (state, { payload }) => {
      Object.assign(state.courseSettings, payload);
    },
    updateUploadAssetsDataSuccess: (state, { payload }) => {
      Object.assign(state.uploadAssetsData, payload);
    },
  },
});

export const {
  updateSavingStatus,
  updateLoadingDetailsStatus,
  updateLoadingSettingsStatus,
  updateCourseDetailsSuccess,
  fetchCourseDetailsSuccess,
  fetchCourseSettingsSuccess,
  updateUploadAssetsDataSuccess,
} = slice.actions;

export const {
  reducer,
} = slice;
