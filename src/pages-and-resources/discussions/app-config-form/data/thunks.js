import { addModel, addModels } from '../../../../generic/model-store';
import {
  getAppConfig,
  postAppConfig,
} from './api';
import {
  FAILED,
  LOADING,
  updateStatus,
  SAVING,
  SAVED,
  loadAppConfig,
} from './slice';

export function fetchAppConfig(courseId, appId, appConfigId) {
  return async (dispatch) => {
    dispatch(updateStatus({ status: LOADING }));
    try {
      const { app, appConfig, features } = await getAppConfig(courseId, appConfigId, appId);

      dispatch(addModel({ modelType: 'apps', model: app }));
      dispatch(addModels({ modelType: 'features', models: features }));
      dispatch(addModel({ modelType: 'appConfigs', model: appConfig }));

      dispatch(loadAppConfig({
        appId: app.id,
        appConfigId: appConfig.id,
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

export function saveAppConfig(courseId, appId, drafts) {
  return async (dispatch) => {
    dispatch(updateStatus({ status: SAVING }));

    try {
      const { app, appConfig, features } = await postAppConfig(courseId, appId, drafts);

      dispatch(addModel({ modelType: 'apps', model: app }));
      dispatch(addModels({ modelType: 'features', models: features }));
      dispatch(addModel({ modelType: 'appConfigs', model: appConfig }));

      dispatch(loadAppConfig({
        activeAppId: app.id,
        activeAppConfigId: appConfig.id,
        featureIds: features.map(feature => feature.id),
      }));
      dispatch(updateStatus({ status: SAVED }));
    } catch (error) {
      dispatch(updateStatus({ status: FAILED }));
    }
  };
}
