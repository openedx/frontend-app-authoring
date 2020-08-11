import { configureStore } from '@reduxjs/toolkit';
import {
  libraryDetailReducer,
  libraryDetailStoreName,
  libraryCreateFormReducer,
  libraryCreateFormStoreName,
  libraryListReducer,
  libraryListStoreName,
} from './library-authoring';

const store = configureStore({
  reducer: {
    [libraryDetailStoreName]: libraryDetailReducer,
    [libraryCreateFormStoreName]: libraryCreateFormReducer,
    [libraryListStoreName]: libraryListReducer,
  },
});

export default store;
