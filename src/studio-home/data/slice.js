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
    studioHomeCoursesCustomParams: {
      currentPage: 1,
      search: undefined,
      order: 'display_name',
      archivedOnly: false,
      activeOnly: false,
      isFiltered: false,
    },
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
      const { courses, archivedCourses = [], inProcessCourseActions } = payload.results;
      const { numPages, count } = payload;
      state.studioHomeData.courses = courses;
      state.studioHomeData.archivedCourses = archivedCourses;
      state.studioHomeData.inProcessCourseActions = inProcessCourseActions;
      state.studioHomeData.numPages = numPages;
      state.studioHomeData.coursesCount = count;
    },
    fetchLibraryDataSuccess: (state, { payload }) => {
      const { libraries } = payload;
      state.studioHomeData.libraries = libraries;
    },
    updateStudioHomeCoursesCustomParams: (state, { payload }) => {
      const {
        currentPage, isFiltered, search, order, archivedOnly, activeOnly,
      } = payload;
      state.studioHomeCoursesCustomParams.currentPage = currentPage;
      state.studioHomeCoursesCustomParams.isFiltered = isFiltered;
      state.studioHomeCoursesCustomParams.search = search;
      state.studioHomeCoursesCustomParams.order = order;
      state.studioHomeCoursesCustomParams.archivedOnly = archivedOnly;
      state.studioHomeCoursesCustomParams.activeOnly = activeOnly;
    },
  },
});

export const {
  updateSavingStatuses,
  updateLoadingStatuses,
  fetchStudioHomeDataSuccess,
  fetchCourseDataSuccess,
  fetchLibraryDataSuccess,
  updateStudioHomeCoursesCustomParams,
} = slice.actions;

export const {
  reducer,
} = slice;
