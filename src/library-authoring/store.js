import { configureStore } from '@reduxjs/toolkit';
// import {
//   courseImportReducer,
//   libraryBlockReducer,
//   libraryAuthoringReducer,
//   libraryEditReducer,
//   libraryCreateReducer,
//   libraryListReducer,
//   libraryAccessReducer,
// } from './library-authoring';
import { libraryBlockReducer } from '@src/edit-library-block';
import { libraryAuthoringReducer } from '@src/author-library';
import { libraryEditReducer } from '@src/configure-library';
import { libraryCreateReducer } from '@src/create-library';
import { libraryListReducer } from '@src/list-libraries';
import { libraryAccessReducer } from '@src/library-access';
import { courseImportReducer } from '@src/library-course-import';
import { STORE_NAMES } from './common/data';

export const buildStore = (overrides = {}) => configureStore({
  reducer: {
    [STORE_NAMES.BLOCKS]: libraryBlockReducer,
    [STORE_NAMES.AUTHORING]: libraryAuthoringReducer,
    [STORE_NAMES.EDIT]: libraryEditReducer,
    [STORE_NAMES.CREATE]: libraryCreateReducer,
    [STORE_NAMES.COURSE_IMPORT]: courseImportReducer,
    [STORE_NAMES.LIST]: libraryListReducer,
    [STORE_NAMES.ACCESS]: libraryAccessReducer,
  },
  ...overrides,
});

const store = buildStore();

export default store;
