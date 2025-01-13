/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { LinkCheckResult } from '../types';

export interface CourseOptimizerState {
  linkCheckInProgress: boolean | null;
  linkCheckResult: LinkCheckResult | null;
  lastScannedAt: string | null;
  currentStage: number | null;
  error: { msg: string | null; unitUrl: string | null };
  downloadPath: string | null;
  successDate: string | null;
  isErrorModalOpen: boolean;
  loadingStatus: string;
  savingStatus: string;
}

export type RootState = {
  [key: string]: any;
} & {
  courseOptimizer: CourseOptimizerState;
};

const initialState: CourseOptimizerState = {
  linkCheckInProgress: null,
  linkCheckResult: null,
  lastScannedAt: null,
  currentStage: null,
  error: { msg: null, unitUrl: null },
  downloadPath: null,
  successDate: null,
  isErrorModalOpen: false,
  loadingStatus: '',
  savingStatus: '',
};

const slice = createSlice({
  name: 'courseOptimizer',
  initialState,
  reducers: {
    updateLinkCheckInProgress: (state, { payload }) => {
      state.linkCheckInProgress = payload;
    },
    updateLinkCheckResult: (state, { payload }) => {
      state.linkCheckResult = payload;
    },
    updateLastScannedAt: (state, { payload }) => {
      state.lastScannedAt = payload;
    },
    updateCurrentStage: (state, { payload }) => {
      state.currentStage = payload;
    },
    updateDownloadPath: (state, { payload }) => {
      state.downloadPath = payload;
    },
    updateSuccessDate: (state, { payload }) => {
      state.successDate = payload;
    },
    updateError: (state, { payload }) => {
      state.error = payload;
    },
    updateIsErrorModalOpen: (state, { payload }) => {
      state.isErrorModalOpen = payload;
    },
    reset: () => initialState,
    updateLoadingStatus: (state, { payload }) => {
      state.loadingStatus = payload.status;
    },
    updateSavingStatus: (state, { payload }) => {
      state.savingStatus = payload.status;
    },
  },
});

export const {
  updateLinkCheckInProgress,
  updateLinkCheckResult,
  updateLastScannedAt,
  updateCurrentStage,
  updateDownloadPath,
  updateSuccessDate,
  updateError,
  updateIsErrorModalOpen,
  reset,
  updateLoadingStatus,
  updateSavingStatus,
} = slice.actions;

export const {
  reducer,
} = slice;
