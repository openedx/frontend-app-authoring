import { configureStore } from '@reduxjs/toolkit';

import { libraryBlockReducer } from '@src/edit-library-block';
import { libraryAuthoringReducer } from '@src/author-library';
import { libraryEditReducer } from '@src/configure-library';
import { libraryCreateReducer } from '@src/create-library';
import { libraryListReducer } from '@src/list-libraries';
import { libraryAccessReducer } from '@src/library-access';
import { STORE_NAMES } from '@src/library-authoring/common/data';
import { reducer as modelsReducer } from './generic/model-store';
import { reducer as courseDetailReducer } from './data/slice';
import { reducer as discussionsReducer } from './pages-and-resources/discussions';
import { reducer as pagesAndResourcesReducer } from './pages-and-resources/data/slice';
import { reducer as customPagesReducer } from './custom-pages/data/slice';
import { reducer as advancedSettingsReducer } from './advanced-settings/data/slice';
import { reducer as gradingSettingsReducer } from './grading-settings/data/slice';
import { reducer as studioHomeReducer } from './studio-home/data/slice';
import { reducer as scheduleAndDetailsReducer } from './schedule-and-details/data/slice';
import { reducer as liveReducer } from './pages-and-resources/live/data/slice';
import { reducer as filesReducer } from './files-and-videos/files-page/data/slice';
import { reducer as courseTeamReducer } from './course-team/data/slice';
import { reducer as CourseUpdatesReducer } from './course-updates/data/slice';
import { reducer as processingNotificationReducer } from './generic/processing-notification/data/slice';
import { reducer as helpUrlsReducer } from './help-urls/data/slice';
import { reducer as courseExportReducer } from './export-page/data/slice';
import { reducer as genericReducer } from './generic/data/slice';
import { reducer as courseImportReducer } from './import-page/data/slice';
import { reducer as videosReducer } from './files-and-videos/videos-page/data/slice';

/** ***** library-authoring imports ****** */

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
      gradingSettings: gradingSettingsReducer,
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
      [STORE_NAMES.BLOCKS]: libraryBlockReducer,
      [STORE_NAMES.AUTHORING]: libraryAuthoringReducer,
      [STORE_NAMES.EDIT]: libraryEditReducer,
      [STORE_NAMES.CREATE]: libraryCreateReducer,
      [STORE_NAMES.LIST]: libraryListReducer,
      [STORE_NAMES.ACCESS]: libraryAccessReducer,
    },
    preloadedState,
  });
}
