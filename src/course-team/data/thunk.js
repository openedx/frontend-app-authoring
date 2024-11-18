import { RequestStatus } from '../../data/constants';
import {
  getCourseTeam,
  deleteTeamUser,
  createTeamUser,
  changeRoleTeamUser,
} from './api';
import {
  fetchCourseTeamSuccess,
  updateLoadingCourseTeamStatus,
  deleteCourseTeamUser,
  updateSavingStatus,
  setErrorMessage,
} from './slice';

export function fetchCourseTeamQuery(courseId) {
  return async (dispatch) => {
    dispatch(updateLoadingCourseTeamStatus({ status: RequestStatus.IN_PROGRESS }));

    try {
      const courseTeam = await getCourseTeam(courseId);
      dispatch(fetchCourseTeamSuccess(courseTeam));

      dispatch(updateLoadingCourseTeamStatus({ status: RequestStatus.SUCCESSFUL }));
      return true;
    } catch (error) {
      if (error.response && error.response.status === 403) {
        dispatch(updateLoadingCourseTeamStatus({ status: RequestStatus.DENIED }));
      } else {
        dispatch(updateLoadingCourseTeamStatus({ status: RequestStatus.FAILED }));
      }
      return false;
    }
  };
}

export function createCourseTeamQuery(courseId, email) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.IN_PROGRESS }));

    try {
      await createTeamUser(courseId, email);
      const courseTeam = await getCourseTeam(courseId);
      dispatch(fetchCourseTeamSuccess(courseTeam));

      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
      return true;
    } catch (error) {
      const message = error?.response?.data?.error || '';
      dispatch(setErrorMessage(message));

      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
      return false;
    }
  };
}

export function changeRoleTeamUserQuery(courseId, email, role) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.IN_PROGRESS }));

    try {
      await changeRoleTeamUser(courseId, email, role);
      const courseTeam = await getCourseTeam(courseId);
      dispatch(fetchCourseTeamSuccess(courseTeam));

      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
      return true;
    } catch ({ message }) {
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
      return false;
    }
  };
}

export function deleteCourseTeamQuery(courseId, email) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.IN_PROGRESS }));

    try {
      await deleteTeamUser(courseId, email);
      dispatch(deleteCourseTeamUser(email));

      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
      return true;
    } catch (error) {
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
      return false;
    }
  };
}
