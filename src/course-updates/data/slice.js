/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { sortBy } from 'lodash';

const slice = createSlice({
  name: 'courseUpdates',
  initialState: {
    courseUpdates: [],
    courseHandouts: {},
  },
  reducers: {
    fetchCourseUpdatesSuccess: (state, { payload }) => {
      state.courseUpdates = payload;
    },
    createCourseUpdate: (state, { payload }) => {
      state.courseUpdates = [payload, ...state.courseUpdates];
    },
    editCourseUpdate: (state, { payload }) => {
      state.courseUpdates = state.courseUpdates.map((courseUpdate) => {
        if (courseUpdate.id === payload.id) {
          return payload;
        }
        return courseUpdate;
      });
    },
    deleteCourseUpdate: (state, { payload }) => {
      state.courseUpdates = sortBy(payload, 'id').reverse();
    },
    fetchCourseHandoutsSuccess: (state, { payload }) => {
      state.courseHandouts = payload;
    },
    editCourseHandouts: (state, { payload }) => {
      state.courseHandouts = {
        ...state.courseHandouts,
        ...payload,
      };
    },
  },
});

export const {
  fetchCourseUpdatesSuccess,
  createCourseUpdate,
  editCourseUpdate,
  deleteCourseUpdate,
  fetchCourseHandoutsSuccess,
  editCourseHandouts,
} = slice.actions;

export const {
  reducer,
} = slice;
