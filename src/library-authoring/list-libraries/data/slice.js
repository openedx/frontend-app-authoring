/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { LOADING_STATUS } from '../../common';

export const libraryListStoreName = 'libraryList';

export const libraryListInitialState = {
  errorMessage: null,
  libraries: [],
  status: LOADING_STATUS.LOADING,
};

const slice = createSlice({
  name: libraryListStoreName,
  initialState: libraryListInitialState,
  reducers: {
    libraryListRequest: (state) => {
      state.status = LOADING_STATUS.LOADING;
    },
    libraryListSuccess: (state, { payload }) => {
      state.libraries = payload.libraries;
      state.status = LOADING_STATUS.LOADED;
    },
    libraryListFailed: (state, { payload }) => {
      state.errorMessage = payload.errorMessage;
      state.status = LOADING_STATUS.FAILED;
    },
  },
});

export const libraryListActions = slice.actions;
export const libraryListReducer = slice.reducer;
