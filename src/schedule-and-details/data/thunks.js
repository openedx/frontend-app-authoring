import { RequestStatus } from '../../data/constants';
import {
  getCourseDetails,
  updateCourseDetails,
  getCourseSettings,
} from './api';
import {
  updateSavingStatus,
  updateLoadingDetailsStatus,
  updateLoadingSettingsStatus,
  fetchCourseDetailsSuccess,
  updateCourseDetailsSuccess,
  fetchCourseSettingsSuccess,
} from './slice';

export function fetchCourseDetailsQuery(courseId) {
  return async (dispatch) => {
    dispatch(updateLoadingDetailsStatus({ status: RequestStatus.IN_PROGRESS }));

    try {
      const detailsValues = await getCourseDetails(courseId);
      dispatch(fetchCourseDetailsSuccess(detailsValues));
      dispatch(updateLoadingDetailsStatus({ status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      if (error.response && error.response.status === 403) {
        dispatch(updateLoadingDetailsStatus({ courseId, status: RequestStatus.DENIED }));
      } else {
        dispatch(updateLoadingDetailsStatus({ status: RequestStatus.FAILED }));
      }
    }
  };
}

export function updateCourseDetailsQuery(courseId, details) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.IN_PROGRESS }));

    try {
      const detailsValues = await updateCourseDetails(courseId, details);
      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
      dispatch(updateCourseDetailsSuccess(detailsValues));
      return true;
    } catch (error) {
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
      return false;
    }
  };
}

export function fetchCourseSettingsQuery(courseId) {
  return async (dispatch) => {
    dispatch(updateLoadingSettingsStatus({ status: RequestStatus.IN_PROGRESS }));

    try {
      const settingsValues = await getCourseSettings(courseId);
      dispatch(fetchCourseSettingsSuccess(settingsValues));
      dispatch(updateLoadingSettingsStatus({ status: RequestStatus.SUCCESSFUL }));
      return true;
    } catch (error) {
      if (error.response && error.response.status === 403) {
        dispatch(updateLoadingSettingsStatus({ courseId, status: RequestStatus.DENIED }));
      } else {
        dispatch(updateLoadingSettingsStatus({ status: RequestStatus.FAILED }));
      }
      return false;
    }
  };
}
