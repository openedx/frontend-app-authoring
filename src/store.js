import { configureStore } from '@reduxjs/toolkit';
import {
  libraryBlockReducer,
  libraryAuthoringReducer,
  libraryEditReducer,
  libraryCreateReducer,
  libraryListReducer,
  libraryAccessReducer,
} from './library-authoring';
import { STORE_NAMES } from './library-authoring/common/data';

export const buildStore = (overrides = {}) => configureStore({
  reducer: {
    [STORE_NAMES.BLOCKS]: libraryBlockReducer,
    [STORE_NAMES.AUTHORING]: libraryAuthoringReducer,
    [STORE_NAMES.EDIT]: libraryEditReducer,
    [STORE_NAMES.CREATE]: libraryCreateReducer,
    [STORE_NAMES.LIST]: libraryListReducer,
    [STORE_NAMES.ACCESS]: libraryAccessReducer,
  },
  ...overrides,
});

const store = buildStore();

export default store;
