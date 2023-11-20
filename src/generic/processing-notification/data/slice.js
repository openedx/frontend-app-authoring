/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { NOTIFICATION_MESSAGES } from '../../../constants';

const initialState = {
  isShow: false,
  title: NOTIFICATION_MESSAGES.empty,
};

const slice = createSlice({
  name: 'processingNotification',
  initialState,
  reducers: {
    showProcessingNotification: (state, { payload }) => {
      state.isShow = true;
      state.title = payload;
    },
    hideProcessingNotification: () => initialState,
  },
});

export const {
  showProcessingNotification,
  hideProcessingNotification,
} = slice.actions;

export const {
  reducer,
} = slice;
