/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { RequestStatus } from '../../data/constants';

const slice = createSlice({
  name: 'courseChecklist',
  initialState: {
    loadingStatus: {
      launchChecklistStatus: RequestStatus.IN_PROGRESS,
      bestPracticeChecklistStatus: RequestStatus.IN_PROGRESS,
    },
    launchData: {},
    bestPracticeData: {},
  },
  reducers: {
    fetchLaunchChecklistSuccess: (state, { payload }) => {
      state.launchData = payload.data;
    },
    updateLaunchChecklistStatus: (state, { payload }) => {
      state.loadingStatus.launchChecklistStatus = payload.status;
    },
    fetchBestPracticeChecklistSuccess: (state, { payload }) => {
      state.bestPracticeData = payload.data;
    },
    updateBestPracticeChecklisttStatus: (state, { payload }) => {
      state.loadingStatus.bestPracticeChecklistStatus = payload.status;
    },
  },
});

export const {
  fetchLaunchChecklistSuccess,
  updateLaunchChecklistStatus,
  fetchBestPracticeChecklistSuccess,
  updateBestPracticeChecklisttStatus,
} = slice.actions;

export const {
  reducer,
} = slice;
