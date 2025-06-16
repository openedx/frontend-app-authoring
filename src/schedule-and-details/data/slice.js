/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { RequestStatus } from '../../data/constants';

const slice = createSlice({
  name: 'scheduleAndDetails',
  initialState: {
    loadingSettingsStatus: RequestStatus.IN_PROGRESS,
    savingStatus: '',
    courseSettings: {},
  },
  reducers: {
    updateLoadingSettingsStatus: (state, { payload }) => {
      state.loadingSettingsStatus = payload.status;
    },
    updateSavingStatus: (state, { payload }) => {
      state.savingStatus = payload.status;
    },
    fetchCourseSettingsSuccess: (state, { payload }) => {
      Object.assign(state.courseSettings, payload);
    },
  },
});

export const {
  updateSavingStatus,
  updateLoadingSettingsStatus,
  fetchCourseSettingsSuccess,
} = slice.actions;

export const {
  reducer,
} = slice;
