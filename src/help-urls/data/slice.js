/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loadingHelpUrlsStatus: '',
  pages: {},
};

const slice = createSlice({
  name: 'helpUrls',
  initialState,
  reducers: {
    updatePages: (state, { payload }) => {
      state.pages = payload;
    },
    updateLoadingHelpUrlsStatus: (state, { payload }) => {
      state.loadingHelpUrlsStatus = payload.status;
    },
  },
});

export const {
  updatePages,
  updateLoadingHelpUrlsStatus,
} = slice.actions;

export const { reducer } = slice;
