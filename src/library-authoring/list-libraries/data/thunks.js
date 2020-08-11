import { logError } from '@edx/frontend-platform/logging';
import * as api from './api';
import { libraryListActions as actions } from './slice';

const fetchLibraryList = () => async (dispatch) => {
  try {
    dispatch(actions.libraryListRequest());
    const libraries = await api.getLibraryList();
    dispatch(actions.libraryListSuccess({ libraries }));
  } catch (error) {
    dispatch(actions.libraryListFailed({ errorMessage: error.message }));
    logError(error);
  }
};

export default fetchLibraryList;
