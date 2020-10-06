import { logError } from '@edx/frontend-platform/logging';
import * as api from './api';
import { libraryDetailActions as actions } from './slice';

export const fetchLibraryDetail = ({ libraryId }) => async (dispatch) => {
  try {
    dispatch(actions.libraryDetailRequest());
    const library = await api.getLibraryDetail(libraryId);
    dispatch(actions.libraryDetailSuccess({ library }));
  } catch (error) {
    dispatch(actions.libraryDetailFailed({ errorMessage: error.message }));
    logError(error);
  }
};

export const createLibraryBlock = ({ libraryId, data }) => async (dispatch) => {
  try {
    dispatch(actions.libraryDetailRequest());
    const libraryBlock = await api.createLibraryBlock({ libraryId, data });
    dispatch(actions.libraryCreateBlockSuccess({ libraryBlock }));
  } catch (error) {
    dispatch(actions.libraryCreateBlockFailed({ errorMessage: error.message, errorFields: error.fields }));
    logError(error);
  }
};

export const commitLibraryChanges = ({ libraryId }) => async (dispatch) => {
  try {
    dispatch(actions.libraryDetailRequest());
    await api.commitLibraryChanges(libraryId);
    const library = await api.getLibraryDetail(libraryId);
    dispatch(actions.libraryDetailSuccess({ library }));
  } catch (error) {
    dispatch(actions.libraryDetailFailed({ errorMessage: error.message }));
    logError(error);
  }
};

export const revertLibraryChanges = ({ libraryId }) => async (dispatch) => {
  try {
    dispatch(actions.libraryDetailRequest());
    await api.revertLibraryChanges(libraryId);
    const library = await api.getLibraryDetail(libraryId);
    dispatch(actions.libraryDetailSuccess({ library }));
  } catch (error) {
    dispatch(actions.libraryDetailFailed({ errorMessage: error.message }));
    logError(error);
  }
};

export const clearLibraryError = () => async (dispatch) => {
  dispatch(actions.libraryDetailClearError());
};
