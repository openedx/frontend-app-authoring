import { logError } from '@edx/frontend-platform/logging';
import * as api from './api';
import { libraryEditActions as actions } from './slice';

export const updateLibrary = ({ data }) => async (dispatch) => {
  try {
    dispatch(actions.libraryUpdateRequest());
    await api.updateLibrary(data);
    dispatch(actions.libraryUpdateSuccess());
  } catch (error) {
    dispatch(actions.libraryUpdateFailed({ errorMessage: error.message, errorFields: error.fields }));
    logError(error);
  }
};

export const clearError = () => async (dispatch) => {
  dispatch(actions.libraryEditClearError());
};
