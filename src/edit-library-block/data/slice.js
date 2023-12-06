/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { LOADING_STATUS } from '@src/library-authoring/common';
import { STORE_NAMES } from '@src/library-authoring/common/data';

export const libraryBlockInitialState = {
  assets: ({ status: LOADING_STATUS.STANDBY, value: null }),
  errorMessage: null,
  deletion: ({ status: LOADING_STATUS.STANDBY, value: null }),
  view: ({ status: LOADING_STATUS.STANDBY, value: null }),
  metadata: ({ status: LOADING_STATUS.STANDBY, value: null }),
  // TODO: consider removing olx as it does not seem we load or even need this
  olx: ({ status: LOADING_STATUS.STANDBY, value: null }),
};

export const libraryBlockReducers = {
  libraryEnsureBlock: (state, { payload }) => {
    if (state[payload.blockId] === undefined) {
      state.blocks[payload.blockId] = { ...libraryBlockInitialState };
    }
  },
  libraryFocusBlock: (state, { payload }) => {
    state.focusedBlock = payload.blockId;
  },
  libraryBlockQueue: (state, { payload }) => {
    const { attr, blockId } = payload;
    state.blocks[blockId][attr].status = LOADING_STATUS.STANDBY;
  },
  libraryBlockRequest: (state, { payload }) => {
    const { attr, blockId } = payload;
    state.blocks[blockId][attr].status = LOADING_STATUS.LOADING;
    state.blocks[blockId][attr].value = null;
  },
  libraryBlockSuccess: (state, { payload }) => {
    const { attr, blockId, value } = payload;
    state.blocks[blockId][attr].value = value;
    state.blocks[blockId][attr].status = LOADING_STATUS.LOADED;
  },
  libraryBlockFailed: (state, { payload }) => {
    const { attr, blockId, errorMessage } = payload;
    state.blocks[blockId][attr].status = LOADING_STATUS.FAILED;
    state.blocks[blockId].errorMessage = errorMessage;
  },
  libraryBlockClearError: (state, { payload }) => {
    const { blockId } = payload;
    state.blocks[blockId].errorMessage = null;
  },
  libraryClearBlock: (state, { payload }) => {
    delete state.blocks[payload.blockId];
    if (state.focusedBlock === payload.blockId) {
      state.focusedBlock = null;
    }
  },
  libraryBlockUpdateDisplayName: (state, { payload }) => {
    const { blockId, displayName } = payload;
    state.blocks[blockId].metadata.value.display_name = displayName;
  },
};

const slice = createSlice({
  name: STORE_NAMES.BLOCKS,
  // State will be defined by block ID.
  initialState: { blocks: {}, focusedBlock: null },
  reducers: libraryBlockReducers,
});

export const libraryBlockActions = slice.actions;
export const libraryBlockReducer = slice.reducer;
