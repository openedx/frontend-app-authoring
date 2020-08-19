/* eslint-disable no-param-reassign */
import update from 'immutability-helper';
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
      state.errorMessage = null;
      state.library = payload.library;
      state.status = LOADING_STATUS.LOADED;
    },
    libraryDetailFailed: (state, { payload }) => {
      state.errorMessage = payload.errorMessage;
      state.status = LOADING_STATUS.FAILED;
    },
    libraryDetailClearError: (state) => {
      state.errorMessage = null;
    },
    libraryCreateBlockSuccess: (state, { payload }) => {
      state.errorMessage = null;
      state.status = LOADING_STATUS.LOADED;
      state.library = update(state.library, {
        has_unpublished_changes: { $set: true },
        blocks: { $push: [payload.libraryBlock] },
      });
    },
  },
});

export const libraryDetailActions = slice.actions;
export const libraryDetailReducer = slice.reducer;
