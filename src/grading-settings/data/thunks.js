import { RequestStatus } from '../../data/constants';
import {
  getGradingSettings,
  sendGradingSettings,
} from './api';
import {
  sendGradingSettingsSuccess,
  updateLoadingStatus,
  updateSavingStatus,
  fetchGradingSettingsSuccess,
} from './slice';

export function fetchGradingSettings(courseId) {
  return async (dispatch) => {
    dispatch(updateLoadingStatus({ status: RequestStatus.IN_PROGRESS }));
    try {
      const settingValues = await getGradingSettings(courseId);
      dispatch(fetchGradingSettingsSuccess(settingValues));
      dispatch(updateLoadingStatus({ status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(updateLoadingStatus({ status: RequestStatus.FAILED }));
    }
  };
}

export function sendGradingSetting(courseId, settings) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.IN_PROGRESS }));
    try {
      const settingValues = await sendGradingSettings(courseId, settings);
      dispatch(sendGradingSettingsSuccess(settingValues));
      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(updateLoadingStatus({ status: RequestStatus.FAILED }));
    }
  };
}
