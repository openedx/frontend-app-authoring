import { configureStore } from '@reduxjs/toolkit';

// FIXME: because the 'live' plugin is using Redux, we have to hard-code a reference to it here.
// If this app + the plugin were using React-query, there'd be no issues.
import { reducer as liveReducer } from '@openedx-plugins/course-app-live/data/slice';

import { reducer as modelsReducer } from './generic/model-store';
import { reducer as courseDetailReducer } from './data/slice';
import { reducer as discussionsReducer } from './pages-and-resources/discussions/data/slice';
import { reducer as pagesAndResourcesReducer } from './pages-and-resources/data/slice';
import { reducer as customPagesReducer } from './custom-pages/data/slice';
import { reducer as advancedSettingsReducer } from './advanced-settings/data/slice';
import { reducer as studioHomeReducer } from './studio-home/data/slice';
import { reducer as scheduleAndDetailsReducer } from './schedule-and-details/data/slice';
import { reducer as filesReducer } from './files-and-videos/files-page/data/slice';
import { reducer as courseTeamReducer } from './course-team/data/slice';
import { reducer as CourseUpdatesReducer } from './course-updates/data/slice';
import { reducer as processingNotificationReducer } from './generic/processing-notification/data/slice';
import { reducer as helpUrlsReducer } from './help-urls/data/slice';
import { reducer as courseExportReducer } from './export-page/data/slice';
import { reducer as genericReducer } from './generic/data/slice';
import { reducer as courseImportReducer } from './import-page/data/slice';
import { reducer as videosReducer } from './files-and-videos/videos-page/data/slice';
import { reducer as courseOutlineReducer } from './course-outline/data/slice';
import { reducer as courseUnitReducer } from './course-unit/data/slice';
import { reducer as courseChecklistReducer } from './course-checklist/data/slice';
import { reducer as accessibilityPageReducer } from './accessibility-page/data/slice';
import { reducer as textbooksReducer } from './textbooks/data/slice';
import { reducer as certificatesReducer } from './certificates/data/slice';
import { reducer as groupConfigurationsReducer } from './group-configurations/data/slice';

export default function initializeStore(preloadedState = undefined) {
  return configureStore({
    reducer: {
      courseDetail: courseDetailReducer,
      customPages: customPagesReducer,
      discussions: discussionsReducer,
      assets: filesReducer,
      pagesAndResources: pagesAndResourcesReducer,
      scheduleAndDetails: scheduleAndDetailsReducer,
      advancedSettings: advancedSettingsReducer,
      studioHome: studioHomeReducer,
      models: modelsReducer,
      live: liveReducer,
      courseTeam: courseTeamReducer,
      courseUpdates: CourseUpdatesReducer,
      processingNotification: processingNotificationReducer,
      helpUrls: helpUrlsReducer,
      courseExport: courseExportReducer,
      generic: genericReducer,
      courseImport: courseImportReducer,
      videos: videosReducer,
      courseOutline: courseOutlineReducer,
      courseUnit: courseUnitReducer,
      courseChecklist: courseChecklistReducer,
      accessibilityPage: accessibilityPageReducer,
      certificates: certificatesReducer,
      groupConfigurations: groupConfigurationsReducer,
      textbooks: textbooksReducer,
    },
    preloadedState,
  });
}
