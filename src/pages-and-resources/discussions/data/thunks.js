import {
  getApps,
  getAppConfig,
  postAppConfig,
} from './api';
import { addModel, addModels } from '../../../generic/model-store';
import {
  FAILED,
  fetchAppsSuccess,
  fetchAppConfigSuccess,
  LOADING,
  updateStatus,
  SAVING,
  SAVED,
  LOADED,
} from './slice';

/* eslint-disable import/prefer-default-export */
export function fetchApps(courseId) {
  return async (dispatch) => {
    dispatch(updateStatus({ courseId, status: LOADING }));

    try {
      const { apps, features } = await getApps(courseId);

      dispatch(addModels({ modelType: 'apps', models: apps }));
      dispatch(addModels({ modelType: 'features', models: features }));
      dispatch(fetchAppsSuccess({
        appIds: apps.map(app => app.id),
        featureIds: features.map(feature => feature.id),
      }));
      dispatch(updateStatus({ courseId, status: LOADED }));
    } catch (error) {
      // TODO: We need generic error handling in the app for when a request just fails... in other
      // parts of the app (proctored exam settings) we show a nice message and ask the user to
      // reload/try again later.
      dispatch(updateStatus({ courseId, status: FAILED }));
    }
  };
}

export function fetchAppConfig(courseId, appId) {
  return async (dispatch) => {
    dispatch(updateStatus({ courseId, status: LOADING }));

    try {
      const { app, appConfig, features } = await getAppConfig(courseId, appId);

      dispatch(addModel({ modelType: 'apps', model: app }));
      dispatch(addModels({ modelType: 'features', models: features }));
      dispatch(addModel({ modelType: 'appConfigs', model: appConfig }));
      dispatch(fetchAppConfigSuccess({
        activeAppId: app.id,
        activeAppConfigId: appConfig.id,
        featureIds: features.map(feature => feature.id),
      }));
      dispatch(updateStatus({ courseId, status: LOADED }));
    } catch (error) {
      // TODO: We need generic error handling in the app for when a request just fails... in other
      // parts of the app (proctored exam settings) we show a nice message and ask the user to
      // reload/try again later.
      dispatch(updateStatus({ courseId, status: FAILED }));
    }
  };
}

export function saveAppConfig(courseId, appId, drafts) {
  return async (dispatch) => {
    dispatch(updateStatus({ courseId, status: SAVING }));

    try {
      const { app, appConfig, features } = await postAppConfig(courseId, appId, drafts);

      dispatch(addModel({ modelType: 'apps', model: app }));
      dispatch(addModels({ modelType: 'features', models: features }));
      dispatch(addModel({ modelType: 'appConfigs', model: appConfig }));

      dispatch(fetchAppConfigSuccess({
        activeAppId: app.id,
        activeAppConfigId: appConfig.id,
        featureIds: features.map(feature => feature.id),
      }));
      dispatch(updateStatus({ courseId, status: SAVED }));
    } catch (error) {
      dispatch(updateStatus({ courseId, status: FAILED }));
    }
  };
}
