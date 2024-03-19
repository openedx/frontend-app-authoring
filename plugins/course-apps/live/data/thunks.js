import { addModel, addModels, updateModel } from 'CourseAuthoring/generic/model-store';
import { RequestStatus } from 'CourseAuthoring/data/constants';

import {
  getLiveConfiguration,
  getLiveProviders,
  postLiveConfiguration,
  normalizeSettings,
  deNormalizeSettings,
} from './api';
import { loadApps, updateStatus, updateSaveStatus } from './slice';

function updateLiveSettingsState({
  appConfig,
  ...liveSettings
}) {
  return async (dispatch) => {
    dispatch(addModel({ modelType: 'liveAppConfigs', model: appConfig }));
    dispatch(loadApps(liveSettings));
  };
}

export function fetchLiveProviders(courseId) {
  return async (dispatch) => {
    const { activeAppId, selectedAppId, apps } = await getLiveProviders(courseId);

    dispatch(addModels({ modelType: 'liveApps', models: apps }));
    dispatch(loadApps({
      activeAppId,
      selectedAppId,
      appIds: apps.map((app) => app.id),
    }));
  };
}

export function fetchLiveConfiguration(courseId) {
  return async (dispatch) => {
    const settings = await getLiveConfiguration(courseId);
    dispatch(updateLiveSettingsState(settings));
  };
}

export function fetchLiveData(courseId) {
  return async (dispatch) => {
    dispatch(updateStatus({ status: RequestStatus.IN_PROGRESS }));
    try {
      await dispatch(fetchLiveProviders(courseId));
      await dispatch(fetchLiveConfiguration(courseId));
    } catch (error) {
      if (error.response && error.response.status === 403) {
        dispatch(updateStatus({ status: RequestStatus.DENIED }));
      } else {
        dispatch(updateStatus({ status: RequestStatus.FAILED }));
      }
    }
  };
}

export function saveLiveConfiguration(courseId, config, navigate) {
  return async (dispatch) => {
    dispatch(updateSaveStatus({ status: RequestStatus.IN_PROGRESS }));
    try {
      const apps = await postLiveConfiguration(courseId, config);
      dispatch(updateLiveSettingsState(apps));

      dispatch(updateSaveStatus({ status: RequestStatus.SUCCESSFUL }));
      navigate(`/course/${courseId}/pages-and-resources/`);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        dispatch(updateSaveStatus({ status: RequestStatus.DENIED }));
        dispatch(updateStatus({ status: RequestStatus.DENIED }));
      } else {
        dispatch(updateSaveStatus({ status: RequestStatus.FAILED }));
      }
    }
  };
}

export function saveLiveConfigurationAsDraft(config) {
  return async (dispatch) => {
    const { appConfig, ...liveSettings } = normalizeSettings(deNormalizeSettings(config));

    dispatch(updateModel({ modelType: 'liveAppConfigs', model: appConfig }));
    dispatch(loadApps(liveSettings));
  };
}
