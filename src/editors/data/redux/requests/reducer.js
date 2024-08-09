import { createSlice } from '@reduxjs/toolkit';

import { StrictDict } from '../../../utils';

import { RequestStates, RequestKeys } from '../../constants/requests';

const initialState = {
  [RequestKeys.fetchUnit]: { status: RequestStates.inactive },
  [RequestKeys.fetchBlock]: { status: RequestStates.inactive },
  [RequestKeys.fetchStudioView]: { status: RequestStates.inactive },
  [RequestKeys.saveBlock]: { status: RequestStates.inactive },
  [RequestKeys.uploadAsset]: { status: RequestStates.inactive },
  [RequestKeys.allowThumbnailUpload]: { status: RequestStates.inactive },
  [RequestKeys.uploadThumbnail]: { status: RequestStates.inactive },
  [RequestKeys.uploadTranscript]: { status: RequestStates.inactive },
  [RequestKeys.deleteTranscript]: { status: RequestStates.inactive },
  [RequestKeys.fetchCourseDetails]: { status: RequestStates.inactive },
  [RequestKeys.fetchImages]: { status: RequestStates.inactive },
  [RequestKeys.fetchVideos]: { status: RequestStates.inactive },
  [RequestKeys.uploadVideo]: { status: RequestStates.inactive },
  [RequestKeys.checkTranscriptsForImport]: { status: RequestStates.inactive },
  [RequestKeys.importTranscript]: { status: RequestStates.inactive },
  [RequestKeys.fetchVideoFeatures]: { status: RequestStates.inactive },
  [RequestKeys.fetchAdvancedSettings]: { status: RequestStates.inactive },
};

// eslint-disable-next-line no-unused-vars
const requests = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    startRequest: (state, { payload }) => ({
      ...state,
      [payload]: {
        status: RequestStates.pending,
      },
    }),
    completeRequest: (state, { payload }) => ({
      ...state,
      [payload.requestKey]: {
        status: RequestStates.completed,
        response: payload.response,
      },
    }),
    failRequest: (state, { payload }) => ({
      ...state,
      [payload.requestKey]: {
        status: RequestStates.failed,
        error: payload.error,
      },
    }),
    clearRequest: (state, { payload }) => ({
      ...state,
      [payload.requestKey]: {},
    }),
  },
});

const actions = StrictDict(requests.actions);
const { reducer } = requests;

export {
  actions,
  reducer,
  initialState,
};
