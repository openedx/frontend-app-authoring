import { createSlice } from '@reduxjs/toolkit';

import { StrictDict } from '../../../utils';

const initialState = {
  videoSource: '',
  videoId: '',
  fallbackVideos: [
    '',
    '',
  ],
  allowVideoDownloads: false,
  allowVideoSharing: {
    level: 'block',
    value: false,
  },
  videoSharingEnabledForAll: false,
  videoSharingEnabledForCourse: false,
  videoSharingLearnMoreLink: '',
  thumbnail: null,
  transcripts: [],
  selectedVideoTranscriptUrls: {},
  allowTranscriptDownloads: false,
  duration: {
    startTime: '00:00:00',
    stopTime: '00:00:00',
    total: '00:00:00',
  },
  showTranscriptByDefault: false,
  handout: null,
  licenseType: null,
  licenseDetails: {
    attribution: true,
    noncommercial: false,
    noDerivatives: false,
    shareAlike: false,
  },
  courseLicenseType: null,
  courseLicenseDetails: {
    attribution: true,
    noncommercial: false,
    noDerivatives: false,
    shareAlike: false,
  },
  allowThumbnailUpload: null,
  allowTranscriptImport: false,
};

// eslint-disable-next-line no-unused-vars
const video = createSlice({
  name: 'video',
  initialState,
  reducers: {
    updateField: (state, { payload }) => ({
      ...state,
      ...payload,
    }),
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
