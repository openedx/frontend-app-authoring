import { configureStore } from '@reduxjs/toolkit';

import { reducer as modelsReducer } from './generic/model-store';
export default function initializeStore() {
  return configureStore({
    reducer: {
      models: modelsReducer,
    },
  });
}
