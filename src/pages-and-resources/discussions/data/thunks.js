import { getDiscussionApps } from './api';
import { addModels } from '../../../generic/model-store';
import {
  FAILED, fetchAppsSuccess, LOADING, updateStatus,
} from './slice';

/* eslint-disable import/prefer-default-export */
export function fetchApps(courseId) {
  return async (dispatch) => {
    dispatch(updateStatus({ courseId, status: LOADING }));

    try {
      const { apps, features } = await getDiscussionApps(courseId);

      dispatch(addModels({ modelType: 'apps', models: apps }));
      dispatch(addModels({ modelType: 'features', models: features }));
      dispatch(fetchAppsSuccess({
        appIds: apps.map(app => app.id),
        featureIds: features.map(feature => feature.id),
      }));
    } catch (error) {
      dispatch(updateStatus({ courseId, status: FAILED }));
    }
  };
}
