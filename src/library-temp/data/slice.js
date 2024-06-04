/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  showLibrarySidebar: false,
  sidebarBodyComponent: null,
  showToast: false,
  toastMessage: null,
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
    showToast: (state, { payload }) => {
      const { toastMessage } = payload;
      state.showToast = true;
      state.toastMessage = toastMessage;
    },
    closeToast: (state) => {
      state.showToast = false;
      state.toastMessage = null;
    },
  },
});

export const {
  closeLibrarySidebar,
  openAddContentSidebar,
  showToast,
  closeToast,
} = slice.actions;

export const {
  reducer,
} = slice;
