import { configureStore } from '@reduxjs/toolkit';
import {
  libraryBlockReducer,
  libraryBlockStoreName,
  libraryDetailReducer,
  libraryDetailStoreName,
  libraryEditReducer,
  libraryEditStoreName,
  libraryCreateReducer,
  libraryCreateStoreName,
  libraryListReducer,
  libraryListStoreName,
} from './library-authoring';

const store = configureStore({
  reducer: {
    [libraryBlockStoreName]: libraryBlockReducer,
    [libraryDetailStoreName]: libraryDetailReducer,
    [libraryEditStoreName]: libraryEditReducer,
    [libraryCreateStoreName]: libraryCreateReducer,
    [libraryListStoreName]: libraryListReducer,
  },
});

export default store;
