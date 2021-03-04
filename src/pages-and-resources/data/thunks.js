import {
  getPages,
} from './api';
import { addModels } from '../../generic/model-store';
import {
  FAILED,
  fetchPagesSuccess,
  LOADING,
  updateStatus,
  LOADED,
} from './slice';

/* eslint-disable import/prefer-default-export */
export function fetchPages(courseId) {
  return async (dispatch) => {
    dispatch(updateStatus({ courseId, status: LOADING }));

    try {
      const { pages } = await getPages(courseId);

      dispatch(addModels({ modelType: 'pages', models: pages }));
      dispatch(fetchPagesSuccess({
        pageIds: pages.map(page => page.id),
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
