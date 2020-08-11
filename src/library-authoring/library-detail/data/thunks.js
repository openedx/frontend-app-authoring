import { logError } from '@edx/frontend-platform/logging';
import getLibraryDetail from './api';
import { libraryDetailActions as actions } from './slice';

const fetchLibraryDetail = ({ libraryId }) => async (dispatch) => {
  try {
    dispatch(actions.libraryDetailRequest());
    const library = await getLibraryDetail(libraryId);
    dispatch(actions.libraryDetailSuccess({ library }));
  } catch (error) {
    dispatch(actions.libraryDetailFailed({ errorMessage: error.message }));
    logError(error);
  }
};

export default fetchLibraryDetail;
