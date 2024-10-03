import { createSlice } from '@reduxjs/toolkit';

import type { EditorState } from '..';
import { StrictDict } from '../../../utils';

const initialState: EditorState['app'] = {
  blockValue: null,
  unitUrl: null,
  blockContent: null,
  studioView: null,
  saveResponse: null,
  blockId: null,
  blockTitle: null,
  blockType: null,
  learningContextId: null,
  editorInitialized: false,
  studioEndpointUrl: null,
  lmsEndpointUrl: null,
  images: {},
  imageCount: 0,
  videos: {},
  courseDetails: {},
  showRawEditor: false,
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
      learningContextId: payload.learningContextId,
      blockType: payload.blockType,
      blockValue: null,
    }),
    setUnitUrl: (state, { payload }) => ({ ...state, unitUrl: payload }),
    setBlockValue: (state, { payload }) => ({
      ...state,
      blockValue: payload,
      blockTitle: payload.data.display_name,
    }),
    setBlockId: (state, { payload }) => ({ ...state, blockId: payload }),
    setStudioView: (state, { payload }) => ({ ...state, studioView: payload }),
    setBlockContent: (state, { payload }) => ({ ...state, blockContent: payload }),
    setBlockTitle: (state, { payload }) => ({ ...state, blockTitle: payload }),
    setSaveResponse: (state, { payload }) => ({ ...state, saveResponse: payload }),
    initializeEditor: (state) => ({ ...state, editorInitialized: true }),
    setImages: (state, { payload }) => ({
      ...state,
      images: { ...state.images, ...payload.images },
      imageCount: payload.imageCount,
    }),
    resetImages: (state) => ({ ...state, images: {}, imageCount: 0 }),
    setVideos: (state, { payload }) => ({ ...state, videos: payload }),
    setCourseDetails: (state, { payload }) => ({ ...state, courseDetails: payload }),
    setShowRawEditor: (state, { payload }) => ({
      ...state,
      showRawEditor: payload.data?.metadata?.editor === 'raw',
    }),
  },
});

const actions = StrictDict(app.actions);

const { reducer } = app;

export {
  actions,
  initialState,
  reducer,
};
