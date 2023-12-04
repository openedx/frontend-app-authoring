/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { LOADING_STATUS } from '../../common';
import { STORE_NAMES } from '../../common/data';

export const libraryListInitialState = {
  errorMessage: null,
  history: {},
  libraries: {
    data: [],
    count: 0,
  },
  orgs: [],
  status: LOADING_STATUS.LOADING,
};

const slice = createSlice({
  name: STORE_NAMES.LIST,
  initialState: libraryListInitialState,
  reducers: {
    libraryListRequest: (state) => {
      state.status = LOADING_STATUS.LOADING;
    },
    libraryListSuccess: (state, { payload }) => {
      state.libraries = payload.libraries;
      state.orgs = payload.orgs;
      state.status = LOADING_STATUS.LOADED;
    },
    libraryListFailed: (state, { payload }) => {
      state.errorMessage = payload.errorMessage;
      state.status = LOADING_STATUS.FAILED;
    },
  },
});

export const libraryListActions = slice.actions;
export const libraryListReducer = slice.reducer;
