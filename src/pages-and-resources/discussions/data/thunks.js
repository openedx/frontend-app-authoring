import { addModel, addModels } from '../../../generic/model-store';
import { getDiscussionsProviders, getDiscussionsSettings, postDiscussionsSettings } from './api';
import {
  DENIED, FAILED, loadApps, LOADING, SAVED, SAVING, updateSaveStatus, updateStatus,
} from './slice';

function updateDiscussionSettingsState({
  appConfig,
  discussionTopics,
  ...discussionSettings
}) {
  return async (dispatch) => {
    dispatch(addModel({ modelType: 'appConfigs', model: appConfig }));
    dispatch(addModels({ modelType: 'discussionTopics', models: discussionTopics }));
    dispatch(loadApps(discussionSettings));
  };
}

function updateProviderState({
  apps,
  features,
  activeAppId,
}) {
  return async (dispatch) => {
    dispatch(addModels({ modelType: 'apps', models: apps }));
    dispatch(addModels({ modelType: 'features', models: features }));

    dispatch(
      loadApps({
        activeAppId,
        appIds: apps.map((app) => app.id),
        featureIds: features.map((feature) => feature.id),
      }),
    );
  };
}

export function fetchProviders(courseId) {
  return async (dispatch) => {
    dispatch(updateStatus({ status: LOADING }));
    try {
      const apps = await getDiscussionsProviders(courseId);
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

export function fetchDiscussionSettings(courseId, providerId = null) {
  return async (dispatch) => {
    dispatch(updateStatus({ status: LOADING }));
    try {
      const apps = await getDiscussionsSettings(courseId, providerId);
      dispatch(updateDiscussionSettingsState(apps));
    } catch (error) {
      if (error.response && error.response.status === 403) {
        dispatch(updateStatus({ status: DENIED }));
      } else {
        dispatch(updateStatus({ status: FAILED }));
      }
    }
  };
}

export function saveProviderConfig(courseId, appId, drafts, successPath, navigate) {
  return async (dispatch) => {
    dispatch(updateSaveStatus({ status: SAVING }));

    try {
      const apps = await postDiscussionsSettings(courseId, appId, drafts);
      dispatch(updateDiscussionSettingsState(apps));

      dispatch(updateSaveStatus({ status: SAVED }));
      // Note that we redirect here to avoid having to work with the promise over in AppConfigForm.
      navigate(successPath);
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
