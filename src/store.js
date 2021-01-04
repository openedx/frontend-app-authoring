import { configureStore } from '@reduxjs/toolkit';

import { reducer as modelsReducer } from './generic/model-store';
import { reducer as courseDetailReducer } from './course-detail';

export default function initializeStore() {
  return configureStore({
    reducer: {
      courseDetail: courseDetailReducer,
      models: modelsReducer,
    },
  });
}
