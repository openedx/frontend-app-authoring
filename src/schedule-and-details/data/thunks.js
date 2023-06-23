import { RequestStatus } from '../../data/constants';
import {
  getCourseDetails,
  updateCourseDetails,
  getCourseSettings,
  uploadAssets,
} from './api';
import {
  updateSavingStatus,
  updateLoadingDetailsStatus,
  updateLoadingSettingsStatus,
  fetchCourseDetailsSuccess,
  updateCourseDetailsSuccess,
  fetchCourseSettingsSuccess,
  updateUploadAssetsDataSuccess,
} from './slice';

export function fetchCourseDetailsQuery(courseId) {
  return async (dispatch) => {
    dispatch(updateLoadingDetailsStatus({ status: RequestStatus.IN_PROGRESS }));

    try {
      const detailsValues = await getCourseDetails(courseId);
      dispatch(fetchCourseDetailsSuccess(detailsValues));
      dispatch(updateLoadingDetailsStatus({ status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(updateLoadingDetailsStatus({ status: RequestStatus.FAILED }));
    }
  };
}

export function updateCourseDetailsQuery(courseId, details) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.IN_PROGRESS }));

    try {
      const detailsValues = await updateCourseDetails(courseId, details);
      dispatch(updateCourseDetailsSuccess(detailsValues));
      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
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
      dispatch(updateLoadingSettingsStatus({ status: RequestStatus.FAILED }));
      return false;
    }
  };
}

export function updateAssetsQuery(courseId, fileData) {
  return async (dispatch) => {
    dispatch(updateLoadingSettingsStatus({ status: RequestStatus.IN_PROGRESS }));

    try {
      const uploadState = await uploadAssets(courseId, fileData);
      dispatch(updateUploadAssetsDataSuccess(uploadState));
      dispatch(updateLoadingSettingsStatus({ status: RequestStatus.SUCCESSFUL }));
      return true;
    } catch (error) {
      dispatch(updateLoadingSettingsStatus({ status: RequestStatus.FAILED }));
      return false;
    }
  };
}
