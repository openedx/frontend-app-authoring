/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

export const LOADING = 'LOADING';
export const LOADED = 'LOADED';
export const FAILED = 'FAILED';

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
  },
});

export const {
  updateStatus,
  updateCanChangeProviders,
} = slice.actions;

export const {
  reducer,
} = slice;
