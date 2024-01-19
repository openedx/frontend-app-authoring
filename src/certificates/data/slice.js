/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import { RequestStatus } from '../../data/constants';
import { MODE_STATES } from './constants';

const slice = createSlice({
  name: 'certificates',
  initialState: {
    certificatesData: {},
    componentMode: MODE_STATES.noModes,
    loadingStatus: RequestStatus.PENDING,
    savingStatus: '',
    savingImageStatus: '',
  },
  reducers: {
    updateSavingStatus: (state, { payload }) => {
      state.savingStatus = payload.status;
    },
    updateSavingImageStatus: (state, { payload }) => {
      state.savingImageStatus = payload.status;
    },
    updateLoadingStatus: (state, { payload }) => {
      state.loadingStatus = payload.status;
    },
    fetchCertificatesSuccess: (state, { payload }) => {
      Object.assign(state.certificatesData, payload);
    },
    createCertificateSuccess: (state, action) => {
      state.certificatesData.certificates.push(action.payload);
    },
    updateCertificateSuccess: (state, action) => {
      const index = state.certificatesData.certificates.findIndex(c => c.id === action.payload.id);

      if (index !== -1) {
        state.certificatesData.certificates[index] = action.payload;
      }
    },
    setMode: (state, action) => {
      state.componentMode = action.payload;
    },
    deleteCertificateSuccess: (state) => {
      state.certificatesData.certificates = [];
    },
  },
});

export const {
  setMode,
  updateSavingStatus,
  updateLoadingStatus,
  updateSavingImageStatus,
  fetchCertificatesSuccess,
  createCertificateSuccess,
  updateCertificateSuccess,
  deleteCertificateSuccess,
} = slice.actions;

export const { reducer } = slice;
