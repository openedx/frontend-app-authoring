import { PdfState } from '@src/editors/data/redux/pdf/types';
import { createSlice } from '@reduxjs/toolkit';

export const initialPdfState: () => PdfState = () => ({
  displayName: 'pdf',
  url: '',
  allowDownload: true,
  source_text: '',
  source_url: '',
});

const pdf = createSlice({
  name: 'pdf',
  initialState: initialPdfState(),
  reducers: {},
});

export const { reducer, actions } = pdf;
