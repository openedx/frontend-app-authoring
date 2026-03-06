import { PdfState } from '@src/editors/data/redux/pdf/types';
import { createSlice } from '@reduxjs/toolkit';

export const initialPdfState: () => PdfState = () => ({
  displayName: 'pdf',
  url: '',
  allowDownload: true,
  sourceText: '',
  sourceUrl: '',
});

const pdf = createSlice({
  name: 'pdf',
  initialState: initialPdfState(),
  reducers: {
    updateField: (state, { payload }) => ({
      ...state,
      ...payload,
    }),
  },
});

export const { reducer, actions } = pdf;
