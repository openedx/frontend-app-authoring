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
  },
  reducers: {
    updateStatus: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.status = payload.status;
    },
  },
});

export const {
  updateStatus,
} = slice.actions;

export const {
  reducer,
} = slice;
