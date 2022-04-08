import { createSlice } from '@reduxjs/toolkit';

import { StrictDict } from '../../../utils';

const initialState = {
  blockValue: null,
  unitUrl: null,
  blockContent: null,
  saveResponse: null,

  blockId: null,
  blockTitle: null,
  blockType: null,
  courseId: null,
  editorInitialized: false,
  studioEndpointUrl: null,
  lmsEndpointUrl: null,
};

// eslint-disable-next-line no-unused-vars
const app = createSlice({
  name: 'app',
  initialState,
  reducers: {
    initialize: (state, { payload }) => ({
      ...state,
      studioEndpointUrl: payload.studioEndpointUrl,
      lmsEndpointUrl: payload.lmsEndpointUrl,
      blockId: payload.blockId,
      courseId: payload.courseId,
      blockType: payload.blockType,
    }),
    setUnitUrl: (state, { payload }) => ({ ...state, unitUrl: payload }),
    setBlockValue: (state, { payload }) => ({
      ...state,
      blockValue: payload,
      blockTitle: payload.data.display_name,
    }),
    setBlockContent: (state, { payload }) => ({ ...state, blockContent: payload }),
    setBlockTitle: (state, { payload }) => ({ ...state, blockTitle: payload }),
    setSaveResponse: (state, { payload }) => ({ ...state, saveResponse: payload }),
    initializeEditor: (state) => ({ ...state, editorInitialized: true }),
  },
});

const actions = StrictDict(app.actions);

const { reducer } = app;

export {
  actions,
  initialState,
  reducer,
};
