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
      // TODO: We need generic error handling in the app for when a request just fails... in other
      // parts of the app (proctored exam settings) we show a nice message and ask the user to
      // reload/try again later.
      dispatch(updateStatus({ courseId, status: FAILED }));
    }
  };
}
