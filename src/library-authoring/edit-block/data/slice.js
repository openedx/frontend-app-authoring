/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { LOADING_STATUS } from '../../common';
import { STORE_NAMES } from '../../common/data';

export const libraryBlockInitialState = {
  assets: [],
  errorMessage: null,
  metadata: null,
  olx: null,
  status: LOADING_STATUS.LOADING,
  view: null,
};

const slice = createSlice({
  name: STORE_NAMES.BLOCKS,
  // State will be defined by block ID.
  initialState: { blocks: {}, focusedBlock: null },
  reducers: {
    libraryEnsureBlock: (state, { payload }) => {
      if (state[payload.blockId] === undefined) {
        state.blocks[payload.blockId] = { ...libraryBlockInitialState };
      }
    },
    libraryFocusBlock: (state, { payload }) => {
      state.focusedBlock = payload.blockId;
    },
    libraryBlockRequest: (state, { payload }) => {
      state.blocks[payload.blockId].errorMessage = null;
      state.blocks[payload.blockId].view = null;
      state.blocks[payload.blockId].status = LOADING_STATUS.LOADING;
    },
    libraryBlockMetadataSuccess: (state, { payload }) => {
      state.blocks[payload.blockId].errorMessage = null;
      state.blocks[payload.blockId].metadata = payload.metadata;
      state.blocks[payload.blockId].status = LOADING_STATUS.LOADED;
    },
    libraryBlockViewSuccess: (state, { payload }) => {
      state.blocks[payload.blockId].errorMessage = null;
      state.blocks[payload.blockId].view = payload.view;
      state.blocks[payload.blockId].status = LOADING_STATUS.LOADED;
    },
    libraryBlockAssetsSuccess: (state, { payload }) => {
      state.blocks[payload.blockId].errorMessage = null;
      state.blocks[payload.blockId].assets = payload.assets;
      if (payload.metadata) {
        state.blocks[payload.blockId].metadata = payload.metadata;
      }
      state.blocks[payload.blockId].status = LOADING_STATUS.LOADED;
    },
    libraryBlockOlxSuccess: (state, { payload }) => {
      state.blocks[payload.blockId].errorMessage = null;
      state.blocks[payload.blockId].olx = payload.olx;
      if (payload.metadata) {
        state.blocks[payload.blockId].metadata = payload.metadata;
      }
      state.blocks[payload.blockId].status = LOADING_STATUS.LOADED;
    },
    libraryBlockDeleteSuccess: (state, { payload }) => {
      delete state.blocks[payload.blockId];
      if (state.focusedBlock === payload.blockId) {
        state.focusedBlock = null;
      }
    },
    libraryBlockFailed: (state, { payload }) => {
      state.blocks[payload.blockId].errorMessage = payload.errorMessage;
      state.blocks[payload.blockId].status = LOADING_STATUS.FAILED;
    },
    libraryBlockClearError: (state, { payload }) => {
      state.blocks[payload.blockId].errorMessage = null;
    },
    libraryClearBlock: (state, { payload }) => {
      delete state.blocks[payload.blockId];
      if (state.focusedBlock === payload.blockId) {
        state.focusedBlock = null;
      }
    },
  },
});

export const libraryBlockActions = slice.actions;
export const libraryBlockReducer = slice.reducer;
