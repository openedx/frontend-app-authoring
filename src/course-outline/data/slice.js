/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { RequestStatus } from '../../data/constants';

const slice = createSlice({
  name: 'courseOutline',
  initialState: {
    loadingOutlineIndexStatus: RequestStatus.IN_PROGRESS,
    outlineIndexData: {},
  },
  reducers: {
    fetchOutlineIndexSuccess: (state, { payload }) => {
      state.outlineIndexData = payload;
    },
    updateLoadingOutlineIndexStatus: (state, { payload }) => {
      state.loadingOutlineIndexStatus = payload.status;
    },
  },
});

export const {
  fetchOutlineIndexSuccess,
  updateLoadingOutlineIndexStatus,
} = slice.actions;

export const {
  reducer,
} = slice;
