/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'courseOutline',
  initialState: {
    reindex_link: '',
    lms_link: '',
    docsLinks: {
      outline: '',
      grading: '',
      visibility: '',
    },
  },
  reducers: {
    fetchOutlineIndexSuccess: (state, { payload }) => {
      state.reindex_link = payload.reindex_link;
      state.lms_link = payload.lms_link;
      state.docsLinks = {
        outline: payload.learn_more_outline_url,
        grading: payload.learn_more_grading_url,
        visibility: payload.learn_more_visibility_url,
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
