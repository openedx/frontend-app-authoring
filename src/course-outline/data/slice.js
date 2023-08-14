/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { RequestStatus } from '../../data/constants';

const slice = createSlice({
  name: 'courseOutline',
  initialState: {
    loadingOutlineIndexStatus: RequestStatus.IN_PROGRESS,
    outlineIndexData: {},
    savingStatus: '',
    statusBarData: {
      courseReleaseDate: '',
      highlightsEnabledForMessaging: false,
      highlightsDocUrl: '',
      isSelfPaced: false,
      checklist: {
        totalCourseLaunchChecks: 0,
        completedCourseLaunchChecks: 0,
        totalCourseBestPracticesChecks: 0,
        completedCourseBestPracticesChecks: 0,
      },
    },
  },
  reducers: {
    fetchOutlineIndexSuccess: (state, { payload }) => {
      state.outlineIndexData = payload;
    },
    updateLoadingOutlineIndexStatus: (state, { payload }) => {
      state.loadingOutlineIndexStatus = payload.status;
    },
    updateStatusBar: (state, { payload }) => {
      state.statusBarData = {
        ...state.statusBarData,
        ...payload,
      };
    },
    fetchStatusBarChecklistSuccess: (state, { payload }) => {
      state.statusBarData.checklist = {
        ...state.statusBarData.checklist,
        ...payload,
      };
    },
    fetchStatusBarSelPacedSuccess: (state, { payload }) => {
      state.statusBarData.isSelfPaced = payload.isSelfPaced;
    },
    updateSavingStatus: (state, { payload }) => {
      state.savingStatus = payload.status;
    },
  },
});

export const {
  fetchOutlineIndexSuccess,
  updateLoadingOutlineIndexStatus,
  updateStatusBar,
  fetchStatusBarChecklistSuccess,
  fetchStatusBarSelPacedSuccess,
  updateSavingStatus,
} = slice.actions;

export const {
  reducer,
} = slice;
