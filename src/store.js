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
  libraryAccessStoreName,
  libraryAccessReducer,
} from './library-authoring';

const store = configureStore({
  reducer: {
    [libraryBlockStoreName]: libraryBlockReducer,
    [libraryDetailStoreName]: libraryDetailReducer,
    [libraryEditStoreName]: libraryEditReducer,
    [libraryCreateStoreName]: libraryCreateReducer,
    [libraryListStoreName]: libraryListReducer,
    [libraryAccessStoreName]: libraryAccessReducer,
  },
});

export default store;
