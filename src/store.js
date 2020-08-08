import { configureStore } from '@reduxjs/toolkit';
import {
  libraryBlockReducer,
  libraryBlockStoreName,
  libraryDetailReducer,
  libraryDetailStoreName,
  libraryCreateReducer,
  libraryCreateStoreName,
  libraryListReducer,
  libraryListStoreName,
} from './library-authoring';

const store = configureStore({
  reducer: {
    [libraryBlockStoreName]: libraryBlockReducer,
    [libraryDetailStoreName]: libraryDetailReducer,
    [libraryCreateStoreName]: libraryCreateReducer,
    [libraryListStoreName]: libraryListReducer,
  },
});

export default store;
