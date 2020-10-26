/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { LOADING_STATUS } from '../../common';
import { STORE_NAMES } from '../../common/data';

export const libraryBlockInitialState = {
  assets: ({ status: LOADING_STATUS.STANDBY, value: null }),
  errorMessage: null,
  deletion: ({ status: LOADING_STATUS.STANDBY, value: null }),
  view: ({ status: LOADING_STATUS.STANDBY, value: null }),
  metadata: ({ status: LOADING_STATUS.STANDBY, value: null }),
  olx: ({ status: LOADING_STATUS.STANDBY, value: null }),
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
      const { attr } = payload;
      state.blocks[payload.blockId][attr].status = LOADING_STATUS.LOADING;
      state.blocks[payload.blockId][attr].value = null;
    },
    libraryBlockSuccess: (state, { payload }) => {
      const { attr, value } = payload;
      state.blocks[payload.blockId][attr].value = value;
      state.blocks[payload.blockId][attr].status = LOADING_STATUS.LOADED;
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
  },
});

export const libraryBlockActions = slice.actions;
export const libraryBlockReducer = slice.reducer;
