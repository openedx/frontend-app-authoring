/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { LOADING_STATUS, SUBMISSION_STATUS } from '../../common';

export const libraryAccessStoreName = 'libraryAccess';

export const libraryAccessInitialState = {
  library: null,
  users: null,
  errorMessage: null,
  errorFields: null,
  loadingStatus: LOADING_STATUS.LOADING,
  submissionStatus: SUBMISSION_STATUS.UNSUBMITTED,
};

const slice = createSlice({
  name: libraryAccessStoreName,
  initialState: libraryAccessInitialState,
  reducers: {
    libraryAccessRequest: (state) => {
      state.status = LOADING_STATUS.LOADING;
    },
    libraryAccessFailed: (state, { payload }) => {
      state.errorMessage = payload.errorMessage;
      state.errorFields = payload.errorFields;
      state.status = SUBMISSION_STATUS.FAILED;
    },
    libraryAccessClearError: (state) => {
      state.errorMessage = null;
      state.errorFields = null;
    },
    libraryAccessReset: (state) => {
      state.errorMessage = libraryAccessInitialState.errorMessage;
      state.errorFields = libraryAccessInitialState.errorFields;
      state.status = libraryAccessInitialState.status;
    },
    libraryAddUser: (state, { payload }) => {
      state.users.unshift(payload.user);
    },
    libraryRemoveUser: (state, { payload }) => {
      state.users = state.users.filter((user) => user.username !== payload.user.username);
    },
    libraryUpdateUser: (state, { payload }) => {
      const existing = state.users.filter((user) => user.username === payload.user.username)[0];
      Object.assign(existing, payload.user);
    },
    libraryUsersSuccess: (state, { payload }) => {
      state.users = payload.users;
    },
    libraryAccessClear: (state) => {
      Object.assign(state, { ...libraryAccessInitialState });
    },
  },
});

export const libraryAccessActions = slice.actions;
export const libraryAccessReducer = slice.reducer;
