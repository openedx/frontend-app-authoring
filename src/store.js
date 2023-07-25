import { configureStore } from '@reduxjs/toolkit';

import { reducer as modelsReducer } from './generic/model-store';
import { reducer as courseDetailReducer } from './data/slice';
import { reducer as discussionsReducer } from './pages-and-resources/discussions';
import { reducer as pagesAndResourcesReducer } from './pages-and-resources/data/slice';
import { reducer as customPagesReducer } from './custom-pages/data/slice';
import { reducer as advancedSettingsReducer } from './advanced-settings/data/slice';
import { reducer as liveReducer } from './pages-and-resources/live/data/slice';
import { reducer as filesReducer } from './files-and-uploads/data/slice';

export default function initializeStore(preloadedState = undefined) {
  return configureStore({
    reducer: {
      courseDetail: courseDetailReducer,
      customPages: customPagesReducer,
      discussions: discussionsReducer,
      assets: filesReducer,
      pagesAndResources: pagesAndResourcesReducer,
      advancedSettings: advancedSettingsReducer,
      models: modelsReducer,
      live: liveReducer,
    },
    preloadedState,
  });
}
