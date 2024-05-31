/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  showLibrarySheet: false,
  sheetBodyComponent: null,
};

const slice = createSlice({
  name: 'libraryHome',
  initialState,
  reducers: {
    closeLibrarySheet: (state) => {
      state.showLibrarySheet = false;
    },
    openAddContentSheet: (state) => {
      state.sheetBodyComponent = 'add-content';
      state.showLibrarySheet = true;
    },
  },
});

export const {
  closeLibrarySheet,
  openAddContentSheet,
} = slice.actions;

export const {
  reducer,
} = slice;
