/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { RequestStatus } from '../../data/constants';

const slice = createSlice({
  name: 'courseUnit',
  initialState: {
    savingStatus: '',
    loadingStatus: {
      fetchUnitLoadingStatus: RequestStatus.IN_PROGRESS,
    },
    unit: {},
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
    updateSavingStatus: (state, { payload }) => {
      state.savingStatus = payload.status;
    },
  },
});

export const {
  fetchCourseItemSuccess,
  updateLoadingCourseUnitStatus,
  updateSavingStatus,
} = slice.actions;

export const {
  reducer,
} = slice;
