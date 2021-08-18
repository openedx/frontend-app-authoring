import { RequestStatus } from '../../data/constants';
import { updateLoadingStatus } from '../../pages-and-resources/data/slice';

/* eslint-disable import/prefer-default-export */
export function fetchExamSettingsPending(courseId) {
  return async (dispatch) => {
    dispatch(updateLoadingStatus({ courseId, status: RequestStatus.IN_PROGRESS }));
  };
}

export function fetchExamSettingsSuccess(courseId) {
  return async (dispatch) => {
    dispatch(updateLoadingStatus({ courseId, status: RequestStatus.SUCCESSFUL }));
  };
}

export function fetchExamSettingsFailure(courseId) {
  return async (dispatch) => {
    dispatch(updateLoadingStatus({ courseId, status: RequestStatus.FAILED }));
  };
}
