/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { SUBMISSION_STATUS } from '@src/library-authoring/common';
import { STORE_NAMES } from '@src/library-authoring/common/data';
import messages from '../messages';

export const libraryCreateInitialState = {
  createdLibrary: null,
  errorMessage: null,
  errorFields: null,
  orgs: [],
  status: SUBMISSION_STATUS.UNSUBMITTED,
};

const slice = createSlice({
  name: STORE_NAMES.CREATE,
  initialState: libraryCreateInitialState,
  reducers: {
    libraryCreateRequest: (state) => {
      state.status = SUBMISSION_STATUS.SUBMITTING;
      state.createdLibrary = null;
    },
    libraryOrganizationsSuccess: (state, { payload }) => {
      state.orgs = payload.orgs;
    },
    libraryOrganizationsFailed: (state, { payload }) => {
      state.errorMessage = payload.errorMessage;
    },
    libraryCreateSuccess: (state, { payload }) => {
      state.createdLibrary = payload.library;
      state.status = SUBMISSION_STATUS.SUBMITTED;
    },
    libraryCreateFailed: (state, { payload }) => {
      state.errorMessage = payload.errorMessage;
      const errorFields = {};
      Object.keys(payload.errorFields).forEach(field => {
        errorFields[field] = messages[`library.form.field.error.empty.${field}`].defaultMessage;
      });
      state.errorFields = errorFields;
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
