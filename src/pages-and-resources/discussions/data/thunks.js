import { history } from '@edx/frontend-platform';
import { addModel, addModels } from '../../../generic/model-store';

import { getApps, postAppConfig } from './api';
import {
  FAILED,
  loadApps,
  LOADING,
  SAVED,
  SAVING,
  updateStatus,
  updateSaveStatus,
} from './slice';

export function fetchApps(courseId) {
  return async (dispatch) => {
    dispatch(updateStatus({ status: LOADING }));
    try {
      const {
        apps,
        features,
        activeAppId,
        appConfig,
      } = await getApps(courseId);

      dispatch(addModels({ modelType: 'apps', models: apps }));
      dispatch(addModels({ modelType: 'features', models: features }));
      dispatch(addModel({ modelType: 'appConfigs', model: appConfig }));
      dispatch(loadApps({
        activeAppId,
        appIds: apps.map(app => app.id),
        featureIds: features.map(feature => feature.id),
      }));
    } catch (error) {
      // TODO: We need generic error handling in the app for when a request just fails... in other
      // parts of the app (proctored exam settings) we show a nice message and ask the user to
      // reload/try again later.
      dispatch(updateStatus({ status: FAILED }));
    }
  };
}

export function saveAppConfig(courseId, appId, drafts, successPath) {
  return async (dispatch) => {
    dispatch(updateSaveStatus({ status: SAVING }));

    try {
      const {
        apps,
        features,
        activeAppId,
        appConfig,
      } = await postAppConfig(courseId, appId, drafts);

      dispatch(addModels({ modelType: 'apps', models: apps }));
      dispatch(addModels({ modelType: 'features', models: features }));
      dispatch(addModel({ modelType: 'appConfigs', model: appConfig }));
      dispatch(loadApps({
        activeAppId,
        appIds: apps.map(app => app.id),
        featureIds: features.map(feature => feature.id),
      }));
      dispatch(updateSaveStatus({ status: SAVED }));
      // Note that we redirect here to avoid having to work with the promise over in AppConfigForm.
      history.push(successPath);
    } catch (error) {
      // TODO: We need generic error handling in the app for when a request just fails... in other
      // parts of the app (proctored exam settings) we show a nice message and ask the user to
      // reload/try again later.
      dispatch(updateSaveStatus({ status: FAILED }));
    }
  };
}
