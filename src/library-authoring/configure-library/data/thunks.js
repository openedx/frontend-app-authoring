import { logError } from '@edx/frontend-platform/logging';
import * as api from './api';
import * as detailApi from '../../author-library/data/api';
import { libraryEditActions as actions } from './slice';
import { libraryAuthoringActions as detailActions } from '../../author-library/data';
import { annotateThunk } from '../../common/data';

export const updateLibrary = annotateThunk(({ data }) => async (dispatch) => {
  try {
    dispatch(actions.libraryUpdateRequest());
    await api.updateLibrary(data);
    const library = await detailApi.getLibraryDetail(data.libraryId);
    dispatch(detailActions.libraryAuthoringPatch({ library }));
    dispatch(actions.libraryUpdateSuccess());
  } catch (error) {
    dispatch(actions.libraryUpdateFailed({ errorMessage: error.message, errorFields: error.fields }));
    logError(error);
  }
});

export const clearError = annotateThunk(() => async (dispatch) => {
  dispatch(actions.libraryClearError());
});
