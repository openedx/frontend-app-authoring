/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  showLibrarySidebar: false,
  sidebarBodyComponent: null,
};

const slice = createSlice({
  name: 'libraryHome',
  initialState,
  reducers: {
    closeLibrarySidebar: (state) => {
      state.showLibrarySidebar = false;
    },
    openAddContentSidebar: (state) => {
      state.sidebarBodyComponent = 'add-content';
      state.showLibrarySidebar = true;
    },
  },
});

export const {
  closeLibrarySidebar,
  openAddContentSidebar,
} = slice.actions;

export const {
  reducer,
} = slice;
