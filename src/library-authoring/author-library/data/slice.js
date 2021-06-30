/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { LOADING_STATUS, STORE_NAMES } from '../../common';

export const libraryAuthoringInitialState = {
  successMessage: null,
  errorMessage: null,
  errorFields: null,
  library: { status: LOADING_STATUS.STANDBY, value: null },
  blocks: {
    status: LOADING_STATUS.STANDBY,
    value: {
      data: [],
      count: 0,
    },
  },
  ltiUrlClipboard: { status: LOADING_STATUS.STANDBY, value: { blockId: null, lti_url: null } },
};

export const baseLibraryDetailReducers = {
  libraryAuthoringRequest: (state, { payload }) => {
    const { attr } = payload;
    state[attr].status = LOADING_STATUS.LOADING;
  },
  libraryAuthoringSuccess: (state, { payload }) => {
    const { attr, value, message } = payload;
    state[attr].value = value;
    state[attr].status = LOADING_STATUS.LOADED;
    state.successMessage = message !== undefined ? message : null;
  },
  libraryAuthoringFailed: (state, { payload }) => {
    const { attr, errorMessage, errorFields } = payload;
    state[attr].status = LOADING_STATUS.FAILED;
    state.errorMessage = errorMessage;
    state.errorFields = errorFields;
  },
  libraryAuthoringClearError: (state) => {
    state.errorMessage = null;
    state.errorFields = null;
  },
  libraryAuthoringClearSuccess: (state) => {
    state.successMessage = null;
  },
  libraryAuthoringPatch: (state, { payload }) => {
    state.library.value = { ...state.library, ...payload.library };
  },
  libraryAuthoringReset: (state) => {
    Object.assign(state, libraryAuthoringInitialState);
  },
  libraryAuthoringBlockDeleted: (state, { payload }) => {
    state.blocks.value.data = state.blocks.value.data.filter((block) => block.id !== payload.blockId);
    state.blocks.value.count -= 1;
    state.library.value.has_unpublished_deletes = true;
  },
  libraryCreateBlockFailed: (state, { payload }) => {
    state.blocks.status = LOADING_STATUS.FAILED;
    state.errorMessage = payload.errorMessage;
    state.errorFields = payload.errorFields;
  },
  libraryBlockLtiUrlFetchRequest: (state, { payload }) => {
    state.ltiUrlClipboard.status = LOADING_STATUS.LOADING;
    state.ltiUrlClipboard.value = { blockId: payload.blockId };
  },
};

const slice = createSlice({
  name: STORE_NAMES.AUTHORING,
  initialState: libraryAuthoringInitialState,
  reducers: baseLibraryDetailReducers,
});

export const libraryAuthoringActions = slice.actions;
export const libraryAuthoringReducer = slice.reducer;
