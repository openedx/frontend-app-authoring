import { logError } from '@edx/frontend-platform/logging';
import * as api from './api';
import { libraryListActions as actions } from './slice';

const fetchLibraryList = ({ params }) => async (dispatch) => {
  try {
    dispatch(actions.libraryListRequest());
    const [libraries, orgs] = await Promise.all([
      api.getLibraryList(params),
      api.getOrgList(),
    ]);
    dispatch(actions.libraryListSuccess({ libraries, orgs }));
  } catch (error) {
    dispatch(actions.libraryListFailed({ errorMessage: error.message }));
    logError(error);
  }
};

export default fetchLibraryList;
