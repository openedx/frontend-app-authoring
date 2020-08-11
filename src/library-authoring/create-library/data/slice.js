/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { SUBMISSION_STATUS } from '../../common';

export const libraryCreateFormStoreName = 'libraryCreateForm';

export const libraryCreateFormInitialState = {
  createdLibrary: null,
  errorMessage: null,
  errorFields: null,
  status: SUBMISSION_STATUS.UNSUBMITTED,
};

const slice = createSlice({
  name: libraryCreateFormStoreName,
  initialState: libraryCreateFormInitialState,
  reducers: {
    libraryCreateFormRequest: (state) => {
      state.status = SUBMISSION_STATUS.SUBMITTING;
      state.createdLibrary = null;
    },
    libraryCreateFormSuccess: (state, { payload }) => {
      state.createdLibrary = payload.library;
      state.status = SUBMISSION_STATUS.SUBMITTED;
    },
    libraryCreateFormFailed: (state, { payload }) => {
      state.errorMessage = payload.errorMessage;
      state.errorFields = payload.errorFields;
      state.status = SUBMISSION_STATUS.FAILED;
    },
    libraryCreateFormReset: (state) => {
      state.createdLibrary = libraryCreateFormInitialState.createdLibrary;
      state.errorMessage = libraryCreateFormInitialState.errorMessage;
      state.errorFields = libraryCreateFormInitialState.errorFields;
      state.status = libraryCreateFormInitialState.status;
    },
  },
});

export const libraryCreateFormActions = slice.actions;
export const libraryCreateFormReducer = slice.reducer;
