import { NOTIFICATION_MESSAGES } from '../../constants';
import { RequestStatus } from '../../data/constants';
import { hideProcessingNotification, showProcessingNotification } from '../../generic/processing-notification/data/slice';
import {
  getCourseUpdates,
  getCourseHandouts,
  createUpdate,
  editUpdate,
  deleteUpdate,
  editHandouts,
} from './api';
import {
  fetchCourseUpdatesSuccess,
  createCourseUpdate,
  editCourseUpdate,
  deleteCourseUpdate,
  fetchCourseHandoutsSuccess,
  editCourseHandouts,
  updateLoadingStatuses,
  updateSavingStatuses,
} from './slice';

export function fetchCourseUpdatesQuery(courseId) {
  return async (dispatch) => {
    try {
      dispatch(updateLoadingStatuses({ fetchCourseUpdatesQuery: RequestStatus.IN_PROGRESS }));
      const courseUpdates = await getCourseUpdates(courseId);
      dispatch(fetchCourseUpdatesSuccess(courseUpdates));
      dispatch(updateLoadingStatuses({
        status: { fetchCourseUpdatesQuery: RequestStatus.SUCCESSFUL },
        error: { loadingUpdates: false },
      }));
    } catch (error) {
      if (error.response && error.response.status === 403) {
        dispatch(updateLoadingStatuses({
          status: { fetchCourseUpdatesQuery: RequestStatus.DENIED },
          error: { loadingUpdates: true },
        }));
      } else {
        dispatch(updateLoadingStatuses({
          status: { fetchCourseUpdatesQuery: RequestStatus.FAILED },
          error: { loadingUpdates: true },
        }));
      }
    }
  };
}

export function createCourseUpdateQuery(courseId, data) {
  return async (dispatch) => {
    try {
      dispatch(updateSavingStatuses({ createCourseUpdateQuery: RequestStatus.PENDING }));
      dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.saving));
      const courseUpdate = await createUpdate(courseId, data);
      dispatch(createCourseUpdate(courseUpdate));
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatuses({
        status: { createCourseUpdateQuery: RequestStatus.SUCCESSFUL },
        error: { creatingUpdate: false },
      }));
    } catch (error) {
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatuses({
        status: { createCourseUpdateQuery: RequestStatus.FAILED },
        error: { creatingUpdate: true },
      }));
    }
  };
}

export function editCourseUpdateQuery(courseId, data) {
  return async (dispatch) => {
    try {
      dispatch(updateSavingStatuses({ createCourseUpdateQuery: RequestStatus.PENDING }));
      dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.saving));
      const courseUpdate = await editUpdate(courseId, data);
      dispatch(editCourseUpdate(courseUpdate));
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatuses({
        status: { createCourseUpdateQuery: RequestStatus.SUCCESSFUL },
        error: { savingUpdates: false },
      }));
    } catch (error) {
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatuses({
        status: { createCourseUpdateQuery: RequestStatus.FAILED },
        error: { savingUpdates: true },
      }));
    }
  };
}

export function deleteCourseUpdateQuery(courseId, updateId) {
  return async (dispatch) => {
    try {
      dispatch(updateSavingStatuses({ createCourseUpdateQuery: RequestStatus.PENDING }));
      dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.deleting));
      const courseUpdates = await deleteUpdate(courseId, updateId);
      dispatch(deleteCourseUpdate(courseUpdates));
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatuses({
        status: { createCourseUpdateQuery: RequestStatus.SUCCESSFUL },
        error: { deletingUpdates: false },
      }));
    } catch (error) {
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatuses({
        status: { createCourseUpdateQuery: RequestStatus.FAILED },
        error: { deletingUpdates: true },
      }));
    }
  };
}

export function fetchCourseHandoutsQuery(courseId) {
  return async (dispatch) => {
    try {
      dispatch(updateLoadingStatuses({ fetchCourseHandoutsQuery: RequestStatus.IN_PROGRESS }));
      const courseHandouts = await getCourseHandouts(courseId);
      dispatch(fetchCourseHandoutsSuccess(courseHandouts));
      dispatch(updateLoadingStatuses({
        status: { fetchCourseHandoutsQuery: RequestStatus.SUCCESSFUL },
        error: { loadingHandouts: false },
      }));
    } catch (error) {
      if (error.response && error.response.status === 403) {
        dispatch(updateLoadingStatuses({
          status: { fetchCourseHandoutsQuery: RequestStatus.DENIED },
          error: { loadingHandouts: true },
        }));
      } else {
        dispatch(updateLoadingStatuses({
          status: { fetchCourseHandoutsQuery: RequestStatus.FAILED },
          error: { loadingHandouts: true },
        }));
      }
    }
  };
}

export function editCourseHandoutsQuery(courseId, data) {
  return async (dispatch) => {
    try {
      dispatch(updateSavingStatuses({ createCourseUpdateQuery: RequestStatus.PENDING }));
      dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.saving));
      const courseHandouts = await editHandouts(courseId, data);
      dispatch(editCourseHandouts(courseHandouts));
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatuses({
        status: { createCourseUpdateQuery: RequestStatus.SUCCESSFUL },
        error: { savingHandouts: false },
      }));
    } catch (error) {
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatuses({
        status: { createCourseUpdateQuery: RequestStatus.FAILED },
        error: { savingHandouts: true },
      }));
    }
  };
}
