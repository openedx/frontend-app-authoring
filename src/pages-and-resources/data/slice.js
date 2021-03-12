/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

export const LOADING = 'LOADING';
export const LOADED = 'LOADED';
export const FAILED = 'FAILED';

const slice = createSlice({
  name: 'pagesAndResources',
  initialState: {
    pageIds: [],
    status: LOADING,
  },
  reducers: {
    fetchPagesSuccess: (state, { payload }) => {
      state.pageIds = payload.pageIds;
    },
    updateStatus: (state, { payload }) => {
      state.status = payload.status;
    },
  },
});

export const {
  fetchPagesSuccess,
  updateStatus,
} = slice.actions;

export const {
  reducer,
} = slice;
