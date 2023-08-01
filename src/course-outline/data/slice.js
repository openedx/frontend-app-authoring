/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'courseOutline',
  initialState: {
    reindexLink: '',
    lmsLink: '',
    docsLinks: {
      learnMoreOutlineUrl: '',
      learnMoreGradingUrl: '',
      learnMoreVisibilityUrl: '',
    },
  },
  reducers: {
    fetchOutlineIndexSuccess: (state, { payload }) => {
      state.reindexLink = payload.reindexLink;
      state.lmsLink = payload.lmsLink;
      state.docsLinks = {
        learnMoreOutlineUrl: payload.learnMoreOutlineUrl,
        learnMoreGradingUrl: payload.learnMoreGradingUrl,
        learnMoreVisibilityUrl: payload.learnMoreVisibilityUrl,
      };
    },
  },
});

export const {
  fetchOutlineIndexSuccess,
} = slice.actions;

export const {
  reducer,
} = slice;
