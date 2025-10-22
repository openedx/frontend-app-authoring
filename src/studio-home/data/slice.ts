/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { type COURSE_CREATOR_STATES } from '@src/constants';

import { RequestStatus, type RequestStatusType } from '@src/data/constants';

export interface Params {
  currentPage: number;
  search?: string;
  order?: string;
  archivedOnly?: boolean;
  activeOnly?: boolean;
  isFiltered?: boolean;
  cleanFilters?: boolean;
}

export const studioHomeCoursesRequestParamsDefault: Params = {
  currentPage: 1,
  search: '',
  order: 'display_name',
  archivedOnly: undefined,
  activeOnly: undefined,
  isFiltered: false,
  cleanFilters: false,
};

const slice = createSlice({
  name: 'studioHome',
  initialState: {
    loadingStatuses: {
      studioHomeLoadingStatus: RequestStatus.IN_PROGRESS as RequestStatusType,
      courseNotificationLoadingStatus: RequestStatus.IN_PROGRESS as RequestStatusType,
      courseLoadingStatus: RequestStatus.IN_PROGRESS as RequestStatusType,
      libraryLoadingStatus: RequestStatus.IN_PROGRESS as RequestStatusType,
    },
    savingStatuses: {
      courseCreatorSavingStatus: '' as RequestStatusType | '',
      deleteNotificationSavingStatus: '' as RequestStatusType | '',
    },
    studioHomeData: {} as {
      allowCourseReruns?: boolean;
      allowToCreateNewOrg?: boolean;
      canCreateOrganizations?: boolean; // TODO: redundant with 'allowToCreateNewOrg' ???
      allowedOrganizations?: string[];
      allowedOrganizationsForLibraries?: string[];
      courseCreatorStatus?: (typeof COURSE_CREATOR_STATES)[keyof typeof COURSE_CREATOR_STATES];
      coursesCount?: any;
      courses?: any;
      archivedCourses?: any;
      inProcessCourseActions?: any;
      numPages?: any;
      optimizationEnabled?: boolean;
      libraries?: any;
      librariesV1Enabled?: boolean;
      librariesV2Enabled?: boolean;
      platformName?: string;
      rerunCreatorStatus?: boolean;
      requestCourseCreatorUrl?: string;
      showNewLibraryButton?: boolean;
      showNewLibraryV2Button?: boolean;
      studioRequestEmail?: string;
      studioName?: string;
      studioShortName?: string;
      techSupportEmail?: string;
      userIsActive?: boolean;
      canAccessAdvancedSettings?: boolean;
    },
    studioHomeCoursesRequestParams: studioHomeCoursesRequestParamsDefault,
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
    fetchCourseDataSuccessV2: (state, { payload }) => {
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
      Object.assign(state.studioHomeCoursesRequestParams, payload);
    },
    resetStudioHomeCoursesCustomParams: (state) => {
      state.studioHomeCoursesRequestParams = studioHomeCoursesRequestParamsDefault;
    },
  },
});

export const {
  updateSavingStatuses,
  updateLoadingStatuses,
  fetchStudioHomeDataSuccess,
  fetchCourseDataSuccess,
  fetchCourseDataSuccessV2,
  fetchLibraryDataSuccess,
  updateStudioHomeCoursesCustomParams,
  resetStudioHomeCoursesCustomParams,
} = slice.actions;

export const {
  reducer,
} = slice;
