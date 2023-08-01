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
} from './slice';

export function fetchCourseUpdatesQuery(courseId) {
  return async (dispatch) => {
    try {
      const courseUpdates = await getCourseUpdates(courseId);
      dispatch(fetchCourseUpdatesSuccess(courseUpdates));
      return true;
    } catch (error) {
      return false;
    }
  };
}

export function createCourseUpdateQuery(courseId, data) {
  return async (dispatch) => {
    try {
      const courseUpdate = await createUpdate(courseId, data);
      dispatch(createCourseUpdate(courseUpdate));
      return true;
    } catch (error) {
      return false;
    }
  };
}

export function editCourseUpdateQuery(courseId, data) {
  return async (dispatch) => {
    try {
      const courseUpdate = await editUpdate(courseId, data);
      dispatch(editCourseUpdate(courseUpdate));
      return true;
    } catch (error) {
      return false;
    }
  };
}

export function deleteCourseUpdateQuery(courseId, updateId) {
  return async (dispatch) => {
    try {
      const courseUpdates = await deleteUpdate(courseId, updateId);
      dispatch(deleteCourseUpdate(courseUpdates));
      return true;
    } catch (error) {
      return false;
    }
  };
}

export function fetchCourseHandoutsQuery(courseId) {
  return async (dispatch) => {
    try {
      const courseHandouts = await getCourseHandouts(courseId);
      dispatch(fetchCourseHandoutsSuccess(courseHandouts));
      return true;
    } catch (error) {
      return false;
    }
  };
}

export function editCourseHandoutsQuery(courseId, data) {
  return async (dispatch) => {
    try {
      const courseHandouts = await editHandouts(courseId, data);
      dispatch(editCourseHandouts(courseHandouts));
      return true;
    } catch (error) {
      return false;
    }
  };
}
