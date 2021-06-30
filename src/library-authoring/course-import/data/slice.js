/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { LOADING_STATUS } from '../../common';

export const courseImportStoreName = 'libraryAccess';

export const courseImportInitialState = {
  library: null,
  errorMessage: null,
  errorFields: null,
  loadingStatus: LOADING_STATUS.LOADED,
};

export const reducers = {
};

const slice = createSlice({
  name: courseImportStoreName,
  initialState: courseImportInitialState,
  reducers,
});

export const courseImportActions = slice.actions;
export const courseImportReducer = slice.reducer;
