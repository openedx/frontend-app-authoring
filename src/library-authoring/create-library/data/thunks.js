import { logError } from '@edx/frontend-platform/logging';
import apiCreateLibrary from './api';
import { libraryCreateFormActions as actions } from './slice';

export const createLibrary = ({ data }) => async (dispatch) => {
  try {
    dispatch(actions.libraryCreateFormRequest());
    const library = await apiCreateLibrary(data);
    dispatch(actions.libraryCreateFormSuccess({ library }));
  } catch (error) {
    dispatch(actions.libraryCreateFormFailed({ errorMessage: error.message, errorFields: error.fields }));
    logError(error);
  }
};

export const resetForm = () => async (dispatch) => {
  dispatch(actions.libraryCreateFormReset());
};
