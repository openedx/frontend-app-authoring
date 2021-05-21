import { history } from '@edx/frontend-platform';
import {
  addModel, addModels, updateModels,
} from '../../../generic/model-store';

import { getApps, postAppConfig } from './api';
import {
  FAILED,
  loadApps,
  LOADING,
  SAVED,
  SAVING,
  updateStatus,
  updateSaveStatus,
  DENIED,
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
        discussionTopicIds,
        discussionTopics,
      } = await getApps(courseId);

      dispatch(addModels({ modelType: 'apps', models: apps }));
      dispatch(addModels({ modelType: 'features', models: features }));
      dispatch(addModel({ modelType: 'appConfigs', model: appConfig }));
      dispatch(addModels({ modelType: 'discussionTopics', models: discussionTopics }));

      dispatch(loadApps({
        activeAppId,
        appIds: apps.map(app => app.id),
        featureIds: features.map(feature => feature.id),
        discussionTopicIds,
      }));
    } catch (error) {
      if (error.response && error.response.status === 403) {
        dispatch(updateStatus({ status: DENIED }));
      } else {
        dispatch(updateStatus({ status: FAILED }));
      }
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
        discussionTopicIds,
        discussionTopics,
      } = await postAppConfig(courseId, appId, drafts);

      dispatch(addModels({ modelType: 'apps', models: apps }));
      dispatch(addModels({ modelType: 'features', models: features }));
      dispatch(addModel({ modelType: 'appConfigs', model: appConfig }));
      dispatch(addModels({ modelType: 'discussionTopics', models: discussionTopics }));

      dispatch(loadApps({
        activeAppId,
        appIds: apps.map(app => app.id),
        featureIds: features.map(feature => feature.id),
        discussionTopicIds,
      }));
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

export function updatedDiscussionTopics(payload) {
  return async (dispatch) => {
    dispatch(updateModels({ modelType: 'discussionTopics', models: payload }));
  };
}
