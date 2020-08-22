/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { LOADING_STATUS, SUBMISSION_STATUS } from '../../common';

export const libraryEditStoreName = 'libraryEdit';

export const libraryEditInitialState = {
  library: null,
  errorMessage: null,
  errorFields: null,
  loadingStatus: LOADING_STATUS.LOADING,
  submissionStatus: SUBMISSION_STATUS.UNSUBMITTED,
};

const slice = createSlice({
  name: libraryEditStoreName,
  initialState: libraryEditInitialState,
  reducers: {
    libraryUpdateRequest: (state) => {
      state.submissionStatus = SUBMISSION_STATUS.SUBMITTING;
    },
    libraryUpdateSuccess: (state) => {
      state.submissionStatus = SUBMISSION_STATUS.SUBMITTED;
    },
    libraryUpdateFailed: (state, { payload }) => {
      state.errorMessage = payload.errorMessage;
      state.errorFields = payload.errorFields;
      state.submissionStatus = SUBMISSION_STATUS.FAILED;
    },
    libraryClearError: (state) => {
      state.errorMessage = null;
      state.errorFields = null;
    },
  },
});

export const libraryEditActions = slice.actions;
export const libraryEditReducer = slice.reducer;
