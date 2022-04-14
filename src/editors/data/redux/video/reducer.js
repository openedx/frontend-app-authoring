import { createSlice } from '@reduxjs/toolkit';

import { StrictDict } from '../../../utils';

const initialState = {
  videoSource: null,
  fallbackVideos: [],
  allowVideoDownloads: false,
  thumbnail: null,
  transcripts: {},
  allowTranscriptDownloads: false,
  duration: {
    startTime: null,
    stopTime: null,
    total: null,
  },
  showTranscriptByDefault: false,
  handout: null,
  licenseType: null,
  licenseDetails: {
    attribution: false,
    noncommercial: false,
    noDerivatives: false,
    shareAlike: false,
  },
};

// eslint-disable-next-line no-unused-vars
const video = createSlice({
  name: 'video',
  initialState,
  reducers: {
    load: (state, { payload }) => ({
      ...payload,
    }),
  },
});

const actions = StrictDict(video.actions);

const { reducer } = video;

export {
  actions,
  initialState,
  reducer,
};
