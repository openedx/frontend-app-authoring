/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { RequestStatus } from '../../data/constants';

const slice = createSlice({
  name: 'studioHome',
  initialState: {
    loadingStatuses: {
      studioHomeLoadingStatus: RequestStatus.IN_PROGRESS,
      courseNotificationLoadingStatus: RequestStatus.IN_PROGRESS,
      courseLoadingStatus: RequestStatus.IN_PROGRESS,
      libraryLoadingStatus: RequestStatus.IN_PROGRESS,
    },
    savingStatuses: {
      courseCreatorSavingStatus: '',
      deleteNotificationSavingStatus: '',
    },
    studioHomeData: {},
  },
  reducers: {
    updateLoadingStatuses: (state, { payload }) => {
      state.loadingStatuses = { ...state.loadingStatuses, ...payload };
    },
    updateSavingStatuses: (state, { payload }) => {
      state.savingStatuses = { ...state.savingStatuses, ...payload };
    },
    fetchStudioHomeDataSuccess: (state, { payload }) => {
      Object.assign(state.studioHomeData, payload);
    },
    fetchCourseDataSuccess: (state, { payload }) => {
      const { courses, archivedCourses, inProcessCourseActions } = payload;
      state.studioHomeData.courses = courses;
      state.studioHomeData.archivedCourses = archivedCourses;
      state.studioHomeData.inProcessCourseActions = inProcessCourseActions;
    },
    fetchLibraryDataSuccess: (state,  { payload }) => {
      const { libraries } = payload;
      state.studioHomeData.libraries = libraries;
    }
  },
});

export const {
  updateSavingStatuses,
  updateLoadingStatuses,
  fetchStudioHomeDataSuccess,
  fetchCourseDataSuccess,
  fetchLibraryDataSuccess,
} = slice.actions;

export const {
  reducer,
} = slice;
