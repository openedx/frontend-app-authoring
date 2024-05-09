/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { RequestStatus } from '../../data/constants';

const slice = createSlice({
  name: 'textbooks',
  initialState: {
    savingStatus: '',
    loadingStatus: RequestStatus.IN_PROGRESS,
    textbooks: [],
    errorMessage: '',
    currentTextbookId: '',
  },
  reducers: {
    fetchTextbooks: (state, { payload }) => {
      state.textbooks = payload.textbooks;
    },
    updateLoadingStatus: (state, { payload }) => {
      state.loadingStatus = payload.status;
    },
    updateSavingStatus: (state, { payload }) => {
      const { status, errorMessage } = payload;
      state.savingStatus = status;
      state.errorMessage = errorMessage;
    },
    createTextbookSuccess: (state, { payload }) => {
      state.textbooks = [...state.textbooks, payload];
    },
    editTextbookSuccess: (state, { payload }) => {
      state.currentTextbookId = payload.id;
      state.textbooks = state.textbooks.map((textbook) => {
        if (textbook.id === payload.id) {
          return payload;
        }
        return textbook;
      });
    },
    deleteTextbookSuccess: (state, { payload }) => {
      state.textbooks = state.textbooks.filter(({ id }) => id !== payload);
    },
  },
});

export const {
  fetchTextbooks,
  updateLoadingStatus,
  updateSavingStatus,
  createTextbookSuccess,
  editTextbookSuccess,
  deleteTextbookSuccess,
} = slice.actions;

export const { reducer } = slice;
