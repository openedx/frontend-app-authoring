import { logError } from '@edx/frontend-platform/logging';
import * as api from './api';
import { libraryEditActions as actions } from './slice';
import { libraryDetailActions as detailActions } from '../../library-detail/data';

export const updateLibrary = ({ data }) => async (dispatch) => {
  try {
    dispatch(actions.libraryUpdateRequest());
    const library = await api.updateLibrary(data);
    dispatch(detailActions.libraryDetailPatch({ library }));
    dispatch(actions.libraryUpdateSuccess());
  } catch (error) {
    dispatch(actions.libraryUpdateFailed({ errorMessage: error.message, errorFields: error.fields }));
    logError(error);
  }
};

export const clearError = () => async (dispatch) => {
  dispatch(actions.libraryClearError());
};
