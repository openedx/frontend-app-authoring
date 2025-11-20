import { RequestStatus } from '../../data/constants';
import {
  updateCourseDetails,
  getCourseSettings,
} from './api';
import {
  updateSavingStatus,
  updateLoadingSettingsStatus,
  fetchCourseSettingsSuccess,
} from './slice';

export function updateCourseDetailsQuery(courseId, details) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.IN_PROGRESS }));

    try {
      await updateCourseDetails(courseId, details);
      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
      return true;
    } catch {
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
