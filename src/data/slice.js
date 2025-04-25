/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

export const LOADED = 'LOADED';

const slice = createSlice({
  name: 'courseDetail',
  initialState: {
    courseId: null,
    status: null,
    canChangeProvider: null,
    courseDetail: [],
  },
  reducers: {
    updateStatus: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.status = payload.status;
    },
    updateCanChangeProviders: (state, { payload }) => {
      state.canChangeProviders = payload.canChangeProviders;
    },
    updateCourseDetail: (state, { payload }) => {
      const existingIndex = state.courseDetail.findIndex(
        detail => detail.courseId === payload.courseDetail.courseId,
      );
      if (existingIndex === -1) {
        state.courseDetail = [...state.courseDetail, payload.courseDetail];
      } else {
        state.courseDetail[existingIndex] = payload.courseDetail;
      }
    },
  },
});

export const {
  updateStatus,
  updateCanChangeProviders,
  updateCourseDetail,
} = slice.actions;

export const {
  reducer,
} = slice;
