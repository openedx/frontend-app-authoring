import { configureStore, Reducer } from '@reduxjs/toolkit';

// FIXME: because the 'live' plugin is using Redux, we have to hard-code a reference to it here.
// If this app + the plugin were using React-query, there'd be no issues.
import { reducer as liveReducer } from '@openedx-plugins/course-app-live/data/slice';

import { RequestStatusType } from '@src/data/constants';
import { MODE_STATES } from './certificates/data/constants';

import { reducer as modelsReducer } from './generic/model-store';
import { reducer as discussionsReducer } from './pages-and-resources/discussions/data/slice';
import { reducer as pagesAndResourcesReducer } from './pages-and-resources/data/slice';
import { reducer as customPagesReducer } from './custom-pages/data/slice';
import { reducer as advancedSettingsReducer } from './advanced-settings/data/slice';
import { reducer as studioHomeReducer } from './studio-home/data/slice';
import { reducer as scheduleAndDetailsReducer } from './schedule-and-details/data/slice';
import { reducer as filesReducer } from './files-and-videos/files-page/data/slice';
import { reducer as CourseUpdatesReducer } from './course-updates/data/slice';
import { reducer as processingNotificationReducer } from './generic/processing-notification/data/slice';
import { reducer as courseExportReducer } from './export-page/data/slice';
import { reducer as courseOptimizerReducer } from './optimizer-page/data/slice';
import { reducer as genericReducer } from './generic/data/slice';
import { reducer as courseImportReducer } from './import-page/data/slice';
import { reducer as videosReducer } from './files-and-videos/videos-page/data/slice';
import { reducer as courseOutlineReducer } from './course-outline/data/slice';
import { reducer as courseUnitReducer } from './course-unit/data/slice';
import { reducer as courseChecklistReducer } from './course-checklist/data/slice';
import { reducer as textbooksReducer } from './textbooks/data/slice';
import { reducer as certificatesReducer } from './certificates/data/slice';
import { reducer as groupConfigurationsReducer } from './group-configurations/data/slice';

type InferState<ReducerType> = ReducerType extends Reducer<infer T> ? T : never;

/**
 * @deprecated The global Redux state for Authoring MFE, excluding editors.
 *   TODO: refactor each part to use React Context and React Query instead.
 */
export interface DeprecatedReduxState {
  customPages: Record<string, any>;
  discussions: Record<string, any>;
  assets: Record<string, any>;
  pagesAndResources: Record<string, any>;
  scheduleAndDetails: Record<string, any>;
  advancedSettings: Record<string, any>;
  studioHome: InferState<typeof studioHomeReducer>;
  models: Record<string, any>;
  live: Record<string, any>;
  courseUpdates: Record<string, any>;
  processingNotification: Record<string, any>;
  courseExport: Record<string, any>;
  courseOptimizer: Record<string, any>;
  generic: Record<string, any>;
  courseImport: Record<string, any>;
  videos: Record<string, any>;
  courseOutline: Record<string, any>;
  courseUnit: Record<string, any>;
  courseChecklist: Record<string, any>;
  certificates: {
    loadingStatus: RequestStatusType;
    savingStatus: any;
    savingImageStatus: string;
    errorMessage: string;
    componentMode: (typeof MODE_STATES)[keyof typeof MODE_STATES];
    certificatesData: any;
  };
  groupConfigurations: InferState<typeof groupConfigurationsReducer>;
  textbooks: Record<string, any>;
}

export default function initializeStore(preloadedState: Partial<DeprecatedReduxState> | undefined = undefined) {
  return configureStore<DeprecatedReduxState>({
    reducer: {
      customPages: customPagesReducer,
      discussions: discussionsReducer,
      assets: filesReducer,
      pagesAndResources: pagesAndResourcesReducer,
      scheduleAndDetails: scheduleAndDetailsReducer,
      advancedSettings: advancedSettingsReducer,
      studioHome: studioHomeReducer,
      models: modelsReducer,
      live: liveReducer,
      courseUpdates: CourseUpdatesReducer,
      processingNotification: processingNotificationReducer,
      courseExport: courseExportReducer,
      courseOptimizer: courseOptimizerReducer,
      generic: genericReducer,
      courseImport: courseImportReducer,
      videos: videosReducer,
      courseOutline: courseOutlineReducer,
      courseUnit: courseUnitReducer,
      courseChecklist: courseChecklistReducer,
      certificates: certificatesReducer,
      groupConfigurations: groupConfigurationsReducer,
      textbooks: textbooksReducer,
    },
    preloadedState: (preloadedState as DeprecatedReduxState | undefined),
  });
}
