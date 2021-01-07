import { configureStore } from '@reduxjs/toolkit';

import { reducer as modelsReducer } from './generic/model-store';
import { reducer as courseDetailReducer } from './data/slice';

export default function initializeStore() {
  return configureStore({
    reducer: {
      courseDetail: courseDetailReducer,
      models: modelsReducer,
    },
  });
}
