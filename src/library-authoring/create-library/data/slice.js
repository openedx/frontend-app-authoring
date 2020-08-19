/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { SUBMISSION_STATUS } from '../../common';

export const libraryCreateStoreName = 'libraryCreate';

export const libraryCreateInitialState = {
  createdLibrary: null,
  errorMessage: null,
  errorFields: null,
  status: SUBMISSION_STATUS.UNSUBMITTED,
};

const slice = createSlice({
  name: libraryCreateStoreName,
  initialState: libraryCreateInitialState,
  reducers: {
    libraryCreateRequest: (state) => {
      state.status = SUBMISSION_STATUS.SUBMITTING;
      state.createdLibrary = null;
    },
    libraryCreateSuccess: (state, { payload }) => {
      state.createdLibrary = payload.library;
      state.status = SUBMISSION_STATUS.SUBMITTED;
    },
    libraryCreateFailed: (state, { payload }) => {
      state.errorMessage = payload.errorMessage;
      state.errorFields = payload.errorFields;
      state.status = SUBMISSION_STATUS.FAILED;
    },
    libraryCreateClearError: (state) => {
      state.errorMessage = null;
    },
    libraryCreateReset: (state) => {
      state.createdLibrary = libraryCreateInitialState.createdLibrary;
      state.errorMessage = libraryCreateInitialState.errorMessage;
      state.errorFields = libraryCreateInitialState.errorFields;
      state.status = libraryCreateInitialState.status;
    },
  },
});

export const libraryCreateActions = slice.actions;
export const libraryCreateReducer = slice.reducer;
