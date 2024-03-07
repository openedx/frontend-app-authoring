/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'accessibilityPage',
  initialState: {
    savingStatus: '',
  },
  reducers: {
    updateSavingStatus: (state, { payload }) => {
      state.savingStatus = payload.status;
    },
  },
});

export const {
  updateLoadingStatus,
  updateSavingStatus,
} = slice.actions;

export const {
  reducer,
} = slice;
