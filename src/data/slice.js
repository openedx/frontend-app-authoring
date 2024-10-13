/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

export const LOADED = 'LOADED';

const slice = createSlice({
  name: 'courseDetail',
  initialState: {
    courseId: null,
    status: null,
    canChangeProvider: null,
  },
  reducers: {
    updateStatus: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.status = payload.status;
    },
    updateCanChangeProviders: (state, { payload }) => {
      state.canChangeProviders = payload.canChangeProviders;
    },
    fetchWaffleFlagsSuccess: (state, { payload }) => {
      state.waffleFlags = payload.waffleFlags;
    },
  },
});

export const {
  updateStatus,
  updateCanChangeProviders,
  fetchWaffleFlagsSuccess,
} = slice.actions;

export const {
  reducer,
} = slice;
