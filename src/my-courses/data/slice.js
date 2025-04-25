/* eslint-disable linebreak-style */
/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { RequestStatus } from '../../data/constants';

const slice = createSlice({
  name: 'myCourses',
  initialState: {
    loadingStatuses: {
      myCoursesLoadingStatus: RequestStatus.IN_PROGRESS,
      courseNotificationLoadingStatus: RequestStatus.IN_PROGRESS,
      courseLoadingStatus: RequestStatus.IN_PROGRESS,
    },
    savingStatuses: {
      courseCreatorSavingStatus: '',
      deleteNotificationSavingStatus: '',
    },
    myCoursesData: {},
    myCoursesRequestParams: {
      currentPage: 1,
      search: undefined,
      order: 'display_name',
      archivedOnly: undefined,
      activeOnly: undefined,
      isFiltered: false,
      cleanFilters: false,
    },
  },
  reducers: {
    updateLoadingStatuses: (state, { payload }) => {
      state.loadingStatuses = { ...state.loadingStatuses, ...payload };
    },
    updateSavingStatuses: (state, { payload }) => {
      state.savingStatuses = { ...state.savingStatuses, ...payload };
    },
    fetchMyCoursesDataSuccess: (state, { payload }) => {
      Object.assign(state.myCoursesData, payload);
    },
    fetchCourseDataSuccess: (state, { payload }) => {
      const { courses, archivedCourses, inProcessCourseActions } = payload;
      state.myCoursesData.courses = courses;
      state.myCoursesData.archivedCourses = archivedCourses;
      state.myCoursesData.inProcessCourseActions = inProcessCourseActions;
    },
    fetchCourseDataSuccessV2: (state, { payload }) => {
      const { courses, archivedCourses = [], inProcessCourseActions } = payload.results;
      const { numPages, count } = payload;
      state.myCoursesData.courses = courses;
      state.myCoursesData.archivedCourses = archivedCourses;
      state.myCoursesData.inProcessCourseActions = inProcessCourseActions;
      state.myCoursesData.numPages = numPages;
      state.myCoursesData.coursesCount = count;
    },
    updateMyCoursesCoursesCustomParams: (state, { payload }) => {
      Object.assign(state.myCoursesRequestParams, payload);
    },
  },
});

export const {
  updateSavingStatuses,
  updateLoadingStatuses,
  fetchMyCoursesDataSuccess,
  fetchCourseDataSuccess,
  fetchCourseDataSuccessV2,
  fetchLibraryDataSuccess,
  updateMyCoursesCoursesCustomParams,
} = slice.actions;

export const {
  reducer,
} = slice;
