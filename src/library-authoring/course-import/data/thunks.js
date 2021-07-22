import { logError } from '@edx/frontend-platform/logging';
import { getOrganizations } from '../../common';
import * as api from './api';
import { courseImportActions as actions } from './slice';

export const clearErrors = () => (dispatch) => {
  dispatch(actions.clearErrors());
};

export const fetchImportTasksList = ({ params }) => async (dispatch) => {
  try {
    dispatch(actions.fetchImportTasksListRequest());

    const importTasksData = await api.getImportTasks(params);

    dispatch(actions.fetchImportTasksListSuccess(importTasksData));
  } catch (error) {
    dispatch(actions.fetchImportTasksListFailed({ errorMessage: error.message }));
    logError(error);
  }
};

export const importBlocks = ({ params }) => async (dispatch) => {
  const { libraryId, courseId, taskPaginationParams } = params;

  try {
    dispatch(actions.importBlocksRequest({ courseId }));

    await api.importBlocks(params);
    dispatch(fetchImportTasksList({ params: { libraryId, taskPaginationParams } }));

    dispatch(actions.importBlocksSuccess({ courseId }));
  } catch (error) {
    dispatch(actions.importBlocksFailed({ courseId, errorMessage: error.message }));
    logError(error);
  }
};

export const fetchImportableCourseList = ({ params }) => async (dispatch) => {
  try {
    dispatch(actions.courseListRequest());

    const coursesData = await api.getCourseList(params);

    dispatch(actions.courseListSuccess(coursesData));
  } catch (error) {
    dispatch(actions.courseListFailed({ errorMessage: error.message }));
    logError(error);
  }
};

export const fetchOrganizationList = () => async (dispatch) => {
  try {
    dispatch(actions.fetchOrganizationListRequest());

    const organizations = await getOrganizations();

    dispatch(actions.fetchOrganizationListSuccess({ organizations }));
  } catch (error) {
    dispatch(actions.fetchOrganizationListFailed({ errorMessage: error.message }));
    logError(error);
  }
};
