import { history } from '@edx/frontend-platform';
import { addModel, addModels } from '../../../generic/model-store';
import { getLiveProviders, getLiveSettings, postLiveSettings } from './api';
import {
  DENIED, FAILED, loadApps, LOADING, SAVED, SAVING, updateSaveStatus, updateStatus,
} from './slice';

function updateLiveSettingsState({
  appConfig,
  ...liveSettings
}) {
  return async (dispatch) => {
    dispatch(addModel({ modelType: 'liveAppConfigs', model: appConfig }));
    dispatch(loadApps(liveSettings));
  };
}

function updateProviderState({
  apps,
  activeAppId,
}) {
  return async (dispatch) => {
    dispatch(addModels({ modelType: 'liveApps', models: apps }));

    dispatch(
      loadApps({
        activeAppId,
        appIds: apps.map((app) => app.id),
      }),
    );
  };
}

export function fetchLiveProviders(courseId) {
  return async (dispatch) => {
    dispatch(updateStatus({ status: LOADING }));
    try {
      const apps = await getLiveProviders(courseId);
      dispatch(updateProviderState(apps));
    } catch (error) {
      if (error.response && error.response.status === 403) {
        dispatch(updateStatus({ status: DENIED }));
      } else {
        dispatch(updateStatus({ status: FAILED }));
      }
    }
  };
}

export function fetchLiveSettings(courseId, providerId = null) {
  return async (dispatch) => {
    dispatch(updateStatus({ status: LOADING }));
    try {
      const apps = await getLiveSettings(courseId, providerId);
      dispatch(updateLiveSettingsState(apps));
    } catch (error) {
      if (error.response && error.response.status === 403) {
        dispatch(updateStatus({ status: DENIED }));
      } else {
        dispatch(updateStatus({ status: FAILED }));
      }
    }
  };
}

export function saveProviderConfig(courseId, appId, drafts, successPath) {
  return async (dispatch) => {
    dispatch(updateSaveStatus({ status: SAVING }));

    try {
      const apps = await postLiveSettings(courseId, appId, drafts);
      dispatch(updateLiveSettingsState(apps));

      dispatch(updateSaveStatus({ status: SAVED }));
      // Note that we redirect here to avoid having to work with the promise over in AppConfigForm.
      history.push(successPath);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        dispatch(updateSaveStatus({ status: DENIED }));
        // This second one will remove the interface as well and hide it from the user.
        dispatch(updateStatus({ status: DENIED }));
      } else {
        dispatch(updateSaveStatus({ status: FAILED }));
      }
    }
  };
}
