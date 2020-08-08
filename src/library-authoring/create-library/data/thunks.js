import { logError } from '@edx/frontend-platform/logging';
import * as api from './api';
import { libraryCreateActions as actions } from './slice';

export const createLibrary = ({ data }) => async (dispatch) => {
  try {
    dispatch(actions.libraryCreateRequest());
    const library = await api.createLibrary(data);
    dispatch(actions.libraryCreateSuccess({ library }));
  } catch (error) {
    dispatch(actions.libraryCreateFailed({ errorMessage: error.message, errorFields: error.fields }));
    logError(error);
  }
};

export const resetForm = () => async (dispatch) => {
  dispatch(actions.libraryCreateReset());
};
