/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

export const LOADING = 'LOADING';
export const LOADED = 'LOADED';
export const FAILED = 'FAILED';
export const DENIED = 'DENIED';
export const SAVING = 'SAVING';
export const SAVED = 'SAVED';

const slice = createSlice({
  name: 'discussions',
  initialState: {
    appIds: [],
    featureIds: [],
    // activeAppId is the ID of the app that has been configured for the course.
    activeAppId: null,
    // selectedAppId is the ID of the app that has been selected in the UI.  This happens when an
    // activeAppId has been configured but the user is about to configure a different provider
    // instead.
    selectedAppId: null,
    status: LOADING,
    saveStatus: SAVED,
    // ValidationError is the Flag that represents a form validation status.
    hasValidationError: false,
    discussionTopicIds: [],
    dividedDiscussionsIds: [],
  },
  reducers: {
    loadApps: (state, { payload }) => {
      state.activeAppId = payload.activeAppId;
      state.appIds = payload.appIds;
      state.featureIds = payload.featureIds;
      state.status = LOADED;
      state.saveStatus = SAVED;
      state.discussionTopicIds = payload.discussionTopicIds;
      state.dividedDiscussionsIds = payload.dividedDiscussionsIds;
    },
    selectApp: (state, { payload }) => {
      const { appId } = payload;
      state.selectedAppId = appId;
    },
    updateStatus: (state, { payload }) => {
      const { status } = payload;
      state.status = status;
    },
    updateSaveStatus: (state, { payload }) => {
      const { status } = payload;
      state.saveStatus = status;
    },
    updateValidationStatus: (state, { payload }) => {
      const { hasError } = payload;
      state.hasValidationError = hasError;
    },
    updateDiscussionTopicIds: (state, { payload }) => {
      const { updatedDiscussionTopicIds } = payload;
      state.discussionTopicIds = updatedDiscussionTopicIds;
    },
    updateDividedDiscussionsIds: (state, { payload }) => {
      const { dividedDiscussionsIds } = payload;
      state.dividedDiscussionsIds = dividedDiscussionsIds;
    },
  },
});

export const {
  loadApps,
  selectApp,
  updateStatus,
  updateSaveStatus,
  updateValidationStatus,
  updateDiscussionTopicIds,
  updateDividedDiscussionsIds,
} = slice.actions;

export const {
  reducer,
} = slice;
