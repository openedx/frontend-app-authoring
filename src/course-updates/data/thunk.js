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
      dispatch(updateLoadingStatuses({ fetchCourseHandoutsQuery: RequestStatus.IN_PROGRESS }));
      const courseUpdates = await getCourseUpdates(courseId);
      dispatch(fetchCourseUpdatesSuccess(courseUpdates));
      dispatch(updateLoadingStatuses({ fetchCourseHandoutsQuery: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(updateLoadingStatuses({ fetchCourseHandoutsQuery: RequestStatus.FAILED }));
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
      dispatch(updateSavingStatuses({ createCourseUpdateQuery: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatuses({ createCourseUpdateQuery: RequestStatus.FAILED }));
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
      dispatch(updateSavingStatuses({ createCourseUpdateQuery: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatuses({ createCourseUpdateQuery: RequestStatus.FAILED }));
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
      dispatch(updateSavingStatuses({ createCourseUpdateQuery: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatuses({ createCourseUpdateQuery: RequestStatus.FAILED }));
    }
  };
}

export function fetchCourseHandoutsQuery(courseId) {
  return async (dispatch) => {
    try {
      dispatch(updateLoadingStatuses({ fetchCourseHandoutsQuery: RequestStatus.IN_PROGRESS }));
      const courseHandouts = await getCourseHandouts(courseId);
      dispatch(fetchCourseHandoutsSuccess(courseHandouts));
      dispatch(updateLoadingStatuses({ fetchCourseHandoutsQuery: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(updateLoadingStatuses({ fetchCourseHandoutsQuery: RequestStatus.FAILED }));
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
      dispatch(updateSavingStatuses({ createCourseUpdateQuery: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatuses({ createCourseUpdateQuery: RequestStatus.FAILED }));
    }
  };
}
