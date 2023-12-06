import { logError } from '@edx/frontend-platform/logging';
import { libraryAccessActions as actions } from './slice';
import * as api from './api';

/* eslint-disable-next-line import/prefer-default-export */
export const fetchUserList = ({ libraryId }) => async (dispatch) => {
  try {
    const users = await api.fetchUsers(libraryId);
    dispatch(actions.libraryUsersSuccess({ users }));
  } catch (error) {
    dispatch(actions.libraryAccessFailed({ errorMessage: error.message }));
    logError(error);
  }
};

export const addUser = ({ libraryId, data }) => async (dispatch) => {
  try {
    dispatch(actions.libraryAccessRequest());
    const newUser = await api.addUserToLibrary({ libraryId, data });
    dispatch(actions.libraryAddUser({ user: newUser }));
    dispatch(actions.libraryAccessClearError());
  } catch (error) {
    dispatch(actions.libraryAccessFailed({ errorMessage: error.message, errorFields: error.fields }));
    logError(error);
    // Don't want to return this as successful, as the form will clear out info if we do.
    throw error;
  }
};

export const setUserAccess = ({ libraryId, user, level }) => async (dispatch) => {
  try {
    dispatch(actions.libraryAccessRequest());
    const updatedUser = await api.setUserAccessLevel({ libraryId, user, level });
    dispatch(actions.libraryUpdateUser({ user: updatedUser }));
  } catch (error) {
    dispatch(actions.libraryAccessFailed({ errorMessage: error.message, errorFields: error.fields }));
    logError(error);
  }
};

export const removeUserAccess = ({ libraryId, user }) => async (dispatch) => {
  try {
    dispatch(actions.libraryAccessRequest());
    await api.removeUserFromLibrary({ libraryId, user });
    dispatch(actions.libraryRemoveUser({ user }));
  } catch (error) {
    dispatch(actions.libraryAccessFailed({ errorMessage: error.message }));
    logError(error);
  }
};

export const clearAccessErrors = () => async (dispatch) => {
  dispatch(actions.libraryAccessClearError());
};

export const clearAccess = () => async (dispatch) => {
  dispatch(actions.libraryAccessClear());
};
