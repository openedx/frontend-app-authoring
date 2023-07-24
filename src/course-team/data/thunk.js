import {
  getCourseTeam,
  deleteTeamUser,
  createTeamUser,
  changeRoleTeamUser,
} from './api';
import {
  fetchCourseTeamSuccess,
  deleteCourseTeamUser,
  setErrorEmail,
} from './slice';
import { getErrorEmailFromMessage } from '../utils';

export function fetchCourseTeamQuery(courseId) {
  return async (dispatch) => {
    try {
      const courseTeam = await getCourseTeam(courseId);
      dispatch(fetchCourseTeamSuccess(courseTeam));
      return true;
    } catch (error) {
      return false;
    }
  };
}

export function createCourseTeamQuery(courseId, email) {
  return async (dispatch) => {
    try {
      await createTeamUser(courseId, email);
      const courseTeam = await getCourseTeam(courseId);
      dispatch(fetchCourseTeamSuccess(courseTeam));
      return true;
    } catch ({ message }) {
      dispatch(setErrorEmail(getErrorEmailFromMessage(message)));
      return false;
    }
  };
}

export function changeRoleTeamUserQuery(courseId, email, role) {
  return async (dispatch) => {
    try {
      await changeRoleTeamUser(courseId, email, role);
      const courseTeam = await getCourseTeam(courseId);
      dispatch(fetchCourseTeamSuccess(courseTeam));
      return true;
    } catch ({ message }) {
      return false;
    }
  };
}

export function deleteCourseTeamQuery(courseId, email) {
  return async (dispatch) => {
    try {
      await deleteTeamUser(courseId, email);
      dispatch(deleteCourseTeamUser(email));
      return true;
    } catch (error) {
      return false;
    }
  };
}
