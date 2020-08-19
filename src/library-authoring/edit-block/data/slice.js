/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { LOADING_STATUS } from '../../common';

export const libraryBlockStoreName = 'libraryBlock';

export const libraryBlockInitialState = {
  assets: [],
  errorMessage: null,
  metadata: null,
  olx: null,
  redirectToLibrary: false,
  status: LOADING_STATUS.LOADING,
  view: null,
};

const slice = createSlice({
  name: libraryBlockStoreName,
  initialState: libraryBlockInitialState,
  reducers: {
    libraryBlockRequest: (state) => {
      state.errorMessage = null;
      state.redirectToLibrary = false;
      state.view = null;
      state.status = LOADING_STATUS.LOADING;
    },
    libraryBlockMetadataSuccess: (state, { payload }) => {
      state.errorMessage = null;
      state.metadata = payload.metadata;
      state.status = LOADING_STATUS.LOADED;
    },
    libraryBlockViewSuccess: (state, { payload }) => {
      state.errorMessage = null;
      state.view = payload.view;
      state.status = LOADING_STATUS.LOADED;
    },
    libraryBlockAssetsSuccess: (state, { payload }) => {
      state.errorMessage = null;
      state.assets = payload.assets;
      if (payload.metadata) {
        state.metadata = payload.metadata;
      }
      state.status = LOADING_STATUS.LOADED;
    },
    libraryBlockOlxSuccess: (state, { payload }) => {
      state.errorMessage = null;
      state.olx = payload.olx;
      if (payload.metadata) {
        state.metadata = payload.metadata;
      }
      state.status = LOADING_STATUS.LOADED;
    },
    libraryBlockDeleteSuccess: (state) => {
      state.redirectToLibrary = true;
    },
    libraryBlockFailed: (state, { payload }) => {
      state.errorMessage = payload.errorMessage;
      state.status = LOADING_STATUS.FAILED;
    },
    libraryBlockClearError: (state) => {
      state.errorMessage = null;
    },
  },
});

export const libraryBlockActions = slice.actions;
export const libraryBlockReducer = slice.reducer;
