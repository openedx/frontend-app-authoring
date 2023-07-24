/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { RequestStatus } from '../../data/constants';

const slice = createSlice({
  name: 'gradingSettings',
  initialState: {
    loadingStatus: RequestStatus.IN_PROGRESS,
    savingStatus: '',
    gradingSettings: {},
    courseSettings: {},
  },
  reducers: {
    updateLoadingStatus: (state, { payload }) => {
      state.loadingStatus = payload.status;
    },
    updateSavingStatus: (state, { payload }) => {
      state.savingStatus = payload.status;
    },
    fetchGradingSettingsSuccess: (state, { payload }) => {
      Object.assign(state.gradingSettings, payload);
    },
    sendGradingSettingsSuccess: (state, { payload }) => {
      Object.assign(state.gradingSettings, payload);
    },
    fetchCourseSettingsSuccess: (state, { payload }) => {
      Object.assign(state.courseSettings, payload);
    },
  },
});

export const {
  updateLoadingStatus,
  updateSavingStatus,
  fetchGradingSettingsSuccess,
  sendGradingSettingsSuccess,
  fetchCourseSettingsSuccess,
} = slice.actions;

export const {
  reducer,
} = slice;
