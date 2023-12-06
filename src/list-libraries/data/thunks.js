import { logError } from '@edx/frontend-platform/logging';
import { getOrganizations } from '@src/library-authoring/common';
import * as api from './api';
import { libraryListActions as actions } from './slice';

const fetchLibraryList = ({ params }) => async (dispatch) => {
  try {
    dispatch(actions.libraryListRequest());
    const [libraries, orgs] = await Promise.all([
      api.getLibraryList(params),
      getOrganizations(),
    ]);
    dispatch(actions.libraryListSuccess({ libraries, orgs }));
  } catch (error) {
    dispatch(actions.libraryListFailed({ errorMessage: error.message }));
    logError(error);
  }
};

export default fetchLibraryList;
