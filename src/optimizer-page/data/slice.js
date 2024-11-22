/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  linkCheckTriggered: false,
  currentStage: 0,
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
    updateLinkCheckTriggered: (state, { payload }) => {
      state.linkCheckTriggered = payload;
    },
    updateCurrentStage: (state, { payload }) => {
      if (payload >= state.currentStage) {
        state.currentStage = payload;
      }
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
  updateLinkCheckTriggered,
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
