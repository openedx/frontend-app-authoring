/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { LOADING_STATUS, STORE_NAMES } from '@src/library-authoring/common';

export const courseImportInitialState = {
  library: null,
  errorMessage: null,
  courseCount: 0,
  courses: [],
  coursesLoadingStatus: LOADING_STATUS.LOADING,
  importBlocksLoadingStatus: LOADING_STATUS.LOADING,
  importTaskCount: 0,
  importTasks: [],
  importTasksLoadingStatus: LOADING_STATUS.LOADING,
  ongoingImports: {},
  organizations: [],
  organizationsLoadingStatus: LOADING_STATUS.LOADING,
};

const reducers = {
  clearErrors: (state) => {
    state.errorMessage = null;
  },
  importBlocksRequest: (state, { payload }) => {
    state.ongoingImports[payload.courseId] = 'pending';
    state.importBlocksLoadingStatus = LOADING_STATUS.LOADING;
  },
  importBlocksSuccess: (state, { payload }) => {
    state.ongoingImports[payload.courseId] = 'complete';
    state.importBlocksLoadingStatus = LOADING_STATUS.LOADED;
  },
  importBlocksFailed: (state, { payload }) => {
    state.ongoingImports[payload.courseId] = 'error';
    state.errorMessage = payload.errorMessage;
    state.importBlocksLoadingStatus = LOADING_STATUS.FAILED;
  },
  courseListRequest: (state) => {
    state.coursesLoadingStatus = LOADING_STATUS.LOADING;
  },
  courseListSuccess: (state, { payload }) => {
    state.courses = payload.courses;
    state.courseCount = payload.count;
    state.coursesLoadingStatus = LOADING_STATUS.LOADED;
  },
  courseListFailed: (state, { payload }) => {
    state.errorMessage = payload.errorMessage;
    state.coursesLoadingStatus = LOADING_STATUS.FAILED;
  },
  fetchOrganizationListRequest: (state) => {
    state.organizationsLoadingStatus = LOADING_STATUS.LOADING;
  },
  fetchOrganizationListSuccess: (state, { payload }) => {
    state.organizations = payload.organizations;
    state.organizationsLoadingStatus = LOADING_STATUS.LOADED;
  },
  fetchOrganizationListFailed: (state, { payload }) => {
    state.errorMessage = payload.errorMessage;
    state.organizationsLoadingStatus = LOADING_STATUS.FAILED;
  },
  fetchImportTasksListRequest: (state) => {
    state.importTasksLoadingStatus = LOADING_STATUS.LOADING;
  },
  fetchImportTasksListSuccess: (state, { payload }) => {
    state.importTasks = payload.tasks;
    state.importTaskCount = payload.count;
    state.importTasksLoadingStatus = LOADING_STATUS.LOADED;
  },
  fetchImportTasksListFailed: (state, { payload }) => {
    state.errorMessage = payload.errorMessage;
    state.importTasksLoadingStatus = LOADING_STATUS.FAILED;
  },
};

const slice = createSlice({
  name: STORE_NAMES.COURSE_IMPORT,
  initialState: courseImportInitialState,
  reducers,
});

export const courseImportActions = slice.actions;
export const courseImportReducer = slice.reducer;
