/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { RequestStatus } from '../../data/constants';

const slice = createSlice({
  name: 'courseUnit',
  initialState: {
    savingStatus: '',
    errorMessage: '',
    isQueryPending: false,
    isTitleEditFormOpen: false,
    canEdit: true,
    loadingStatus: {
      fetchUnitLoadingStatus: RequestStatus.IN_PROGRESS,
      courseSectionVerticalLoadingStatus: RequestStatus.IN_PROGRESS,
      courseVerticalChildrenLoadingStatus: RequestStatus.IN_PROGRESS,
    },
    unit: {},
    courseSectionVertical: {},
    courseVerticalChildren: { children: [], isPublished: true },
    staticFileNotices: {},
    courseOutlineInfo: {},
    courseOutlineInfoLoadingStatus: RequestStatus.IN_PROGRESS,
    movedXBlockParams: {
      isSuccess: false,
      isUndo: false,
      title: '',
      sourceLocator: '',
      targetParentLocator: '',
    },
  },
  reducers: {
    fetchCourseItemSuccess: (state, { payload }) => {
      state.unit = payload;
    },
    updateLoadingCourseUnitStatus: (state, { payload }) => {
      state.loadingStatus = {
        ...state.loadingStatus,
        fetchUnitLoadingStatus: payload.status,
      };
    },
    updateQueryPendingStatus: (state, { payload }) => {
      state.isQueryPending = payload;
    },
    changeEditTitleFormOpen: (state, { payload }) => {
      state.isTitleEditFormOpen = payload;
    },
    updateSavingStatus: (state, { payload }) => {
      const { status, errorMessage } = payload;
      state.savingStatus = status;
      state.errorMessage = errorMessage;
    },
    fetchSequenceRequest: (state, { payload }) => {
      state.sequenceId = payload.sequenceId;
      state.sequenceStatus = RequestStatus.IN_PROGRESS;
      state.sequenceMightBeUnit = false;
    },
    fetchSequenceSuccess: (state, { payload }) => {
      state.sequenceId = payload.sequenceId;
      state.sequenceStatus = RequestStatus.SUCCESSFUL;
      state.sequenceMightBeUnit = false;
    },
    fetchSequenceFailure: (state, { payload }) => {
      state.sequenceId = payload.sequenceId;
      state.sequenceStatus = RequestStatus.FAILED;
      state.sequenceMightBeUnit = payload.sequenceMightBeUnit || false;
    },
    fetchCourseSectionVerticalDataSuccess: (state, { payload }) => {
      state.courseSectionVertical = payload;
    },
    updateLoadingCourseSectionVerticalDataStatus: (state, { payload }) => {
      state.loadingStatus = {
        ...state.loadingStatus,
        courseSectionVerticalLoadingStatus: payload.status,
      };
    },
    updateLoadingCourseXblockStatus: (state, { payload }) => {
      state.loadingStatus = {
        ...state.loadingStatus,
        createUnitXblockLoadingStatus: payload.status,
      };
    },
    addNewUnitStatus: (state, { payload }) => {
      state.loadingStatus = {
        ...state.loadingStatus,
        fetchUnitLoadingStatus: payload.status,
      };
    },
    updateCourseVerticalChildren: (state, { payload }) => {
      state.courseVerticalChildren = payload;
    },
    updateCourseVerticalChildrenLoadingStatus: (state, { payload }) => {
      state.loadingStatus.courseVerticalChildrenLoadingStatus = payload.status;
    },
    deleteXBlock: (state, { payload }) => {
      state.courseVerticalChildren.children = state.courseVerticalChildren.children.filter(
        (component) => component.id !== payload,
      );
    },
    duplicateXBlock: (state, { payload }) => {
      state.courseVerticalChildren = {
        ...payload.newCourseVerticalChildren,
        children: payload.newCourseVerticalChildren.children.map((component) => {
          if (component.blockId === payload.newId) {
            component.shouldScroll = true;
          }
          return component;
        }),
      };
    },
    fetchStaticFileNoticesSuccess: (state, { payload }) => {
      state.staticFileNotices = payload;
    },
    updateCourseOutlineInfo: (state, { payload }) => {
      state.courseOutlineInfo = payload;
    },
    updateCourseOutlineInfoLoadingStatus: (state, { payload }) => {
      state.courseOutlineInfoLoadingStatus = payload.status;
    },
    updateMovedXBlockParams: (state, { payload }) => {
      state.movedXBlockParams = { ...state.movedXBlockParams, ...payload };
    },
  },
});

export const {
  fetchCourseItemSuccess,
  updateLoadingCourseUnitStatus,
  updateSavingStatus,
  updateModel,
  fetchSequenceRequest,
  fetchSequenceSuccess,
  fetchSequenceFailure,
  fetchCourseSectionVerticalDataSuccess,
  updateLoadingCourseSectionVerticalDataStatus,
  changeEditTitleFormOpen,
  updateQueryPendingStatus,
  updateLoadingCourseXblockStatus,
  updateCourseVerticalChildren,
  updateCourseVerticalChildrenLoadingStatus,
  deleteXBlock,
  duplicateXBlock,
  fetchStaticFileNoticesSuccess,
  updateCourseOutlineInfo,
  updateCourseOutlineInfoLoadingStatus,
  updateMovedXBlockParams,
} = slice.actions;

export const {
  reducer,
} = slice;
