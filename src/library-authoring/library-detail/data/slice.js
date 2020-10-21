/* eslint-disable no-param-reassign */
import update from 'immutability-helper';
import { createSlice } from '@reduxjs/toolkit';

import { LOADING_STATUS, STORE_NAMES } from '../../common';

export const libraryDetailInitialState = {
  errorMessage: null,
  errorFields: null,
  library: null,
  status: LOADING_STATUS.LOADING,
};

export const baseLibraryDetailReducers = {
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
  libraryDetailPatch: (state, { payload }) => {
    state.library = { ...state.library, ...payload.library };
  },
  libraryDetailReset: (state) => {
    Object.assign(state, libraryDetailInitialState);
  },
  libraryDetailBlockDeleted: (state, { payload }) => {
    state.library.blocks = state.library.blocks.filter((block) => block.id !== payload.blockId);
  },
  libraryCreateBlockSuccess: (state, { payload }) => {
    state.errorMessage = null;
    state.status = LOADING_STATUS.LOADED;
    state.library = update(state.library, {
      has_unpublished_changes: { $set: true },
      blocks: { $push: [payload.libraryBlock] },
    });
  },
  libraryCreateBlockFailed: (state, { payload }) => {
    state.status = LOADING_STATUS.FAILED;
    state.errorMessage = payload.errorMessage;
    state.errorFields = payload.errorFields;
  },
};

const slice = createSlice({
  name: STORE_NAMES.DETAIL,
  initialState: libraryDetailInitialState,
  reducers: baseLibraryDetailReducers,
});

export const libraryDetailActions = slice.actions;
export const libraryDetailReducer = slice.reducer;
