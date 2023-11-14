/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { RequestStatus } from '../../data/constants';

const slice = createSlice({
  name: 'generic',
  initialState: {
    loadingStatuses: {
      organizationLoadingStatus: RequestStatus.IN_PROGRESS,
      courseRerunLoadingStatus: RequestStatus.IN_PROGRESS,
    },
    savingStatus: '',
    organizations: [],
    createOrRerunCourse: {
      courseData: {},
      courseRerunData: {},
      redirectUrlObj: {},
      postErrors: {},
    },
    userPermissions: [],
    userPermissionsEnabled: false,
  },
  reducers: {
    fetchOrganizations: (state, { payload }) => {
      state.organizations = payload;
    },
    updateLoadingStatuses: (state, { payload }) => {
      state.loadingStatuses = { ...state.loadingStatuses, ...payload };
    },
    updateSavingStatus: (state, { payload }) => {
      state.savingStatus = payload.status;
    },
    updateCourseData: (state, { payload }) => {
      state.createOrRerunCourse.courseData = payload;
    },
    updateCourseRerunData: (state, { payload }) => {
      state.createOrRerunCourse.courseRerunData = payload;
    },
    updateRedirectUrlObj: (state, { payload }) => {
      state.createOrRerunCourse.redirectUrlObj = payload;
    },
    updatePostErrors: (state, { payload }) => {
      state.createOrRerunCourse.postErrors = payload;
    },
    updateUserPermissions: (state, { payload }) => {
      state.userPermissions = payload;
    },
    updateUserPermissionsEnabled: (state, { payload }) => {
      state.userPermissionsEnabled = payload;
    },
  },
});

export const {
  fetchOrganizations,
  updatePostErrors,
  updateCourseRerunData,
  updateLoadingStatuses,
  updateSavingStatus,
  updateCourseData,
  updateRedirectUrlObj,
  updateUserPermissions,
  updateUserPermissionsEnabled,
} = slice.actions;

export const {
  reducer,
} = slice;
