/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { LOADING_STATUS } from '../../common';

export const libraryDetailStoreName = 'libraryDetail';

export const libraryDetailInitialState = {
  errorMessage: null,
  library: null,
  status: LOADING_STATUS.LOADING,
};

const slice = createSlice({
  name: libraryDetailStoreName,
  initialState: libraryDetailInitialState,
  reducers: {
    libraryDetailRequest: (state) => {
      state.status = LOADING_STATUS.LOADING;
    },
    libraryDetailSuccess: (state, { payload }) => {
      state.library = payload.library;
      state.status = LOADING_STATUS.LOADED;
    },
    libraryDetailFailed: (state, { payload }) => {
      state.errorMessage = payload.errorMessage;
      state.status = LOADING_STATUS.FAILED;
    },
  },
});

export const libraryDetailActions = slice.actions;
export const libraryDetailReducer = slice.reducer;
